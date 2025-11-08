const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...userWithoutPassword } = user;
            // The token is simply the user's email for this mock setup.
            // In a real app, this would be a signed JWT.
            res.json({ token: user.email, user: userWithoutPassword });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // In a real app, generate a secure, random, expiring token.
            const resetToken = `reset-token-${user.id}-${Date.now()}`;

            await prisma.user.update({
                where: { email },
                data: { resetToken },
            });
            
            const resetLink = `http://localhost:5173/#/reset-password/${resetToken}`;

            // If SendGrid API key is configured, send a real email.
            if (process.env.SENDGRID_API_KEY) {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const fromEmail = process.env.SENDGRID_FROM_EMAIL;
                if (!fromEmail) {
                    console.warn('SENDGRID_FROM_EMAIL not set in .env. Falling back to default. This may fail if the sender is not verified in SendGrid.');
                }
                const msg = {
                    to: email,
                    // IMPORTANT: This 'from' email MUST be a verified sender in your SendGrid account.
                    from: fromEmail || 'devanshagile@gmail.com', 
                    subject: 'SuryaKiran CRM: Password Reset Request',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2>Password Reset</h2>
                            <p>You are receiving this email because a password reset request was initiated for your account.</p>
                            <p>Please click the button below to reset your password. This link is valid for one hour.</p>
                            <a href="${resetLink}" style="background-color: #F97316; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                            <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
                            <p>- The SuryaKiran Team</p>
                        </div>
                    `,
                };
                await sgMail.send(msg);
            } else {
                // Fallback for local development if no API key is present.
                console.warn('SENDGRID_API_KEY not found. Logging password reset link to console instead of sending email.');
                console.log(`Password reset link for ${email}: ${resetLink}`);
            }
        }

        // Always return a success message to prevent email enumeration attacks.
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error("Forgot password error:", error);
        if (error.response) {
            console.error(error.response.body)
        }
        if (error.code === 'ENOTFOUND') {
            return res.status(503).json({ message: 'Mail Service Unavailable: Could not connect to the email provider. Please check network settings.' });
        }
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { resetToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null, // Invalidate the token after use
            },
        });

        res.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

module.exports = {
    login,
    requestPasswordReset,
    resetPassword,
};