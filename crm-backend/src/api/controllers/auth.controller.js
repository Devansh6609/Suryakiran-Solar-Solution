const prisma = require('../../config/prisma');
const bcrypt = require('bcrypt');

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
            
            // In a real app, you would use an email service. We log it for demonstration.
            const resetLink = `http://<your-frontend-url>/#/reset-password/${resetToken}`;
            console.log(`Password reset link for ${email}: ${resetLink}`);
        }

        // Always return a success message to prevent email enumeration attacks.
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error("Forgot password error:", error);
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