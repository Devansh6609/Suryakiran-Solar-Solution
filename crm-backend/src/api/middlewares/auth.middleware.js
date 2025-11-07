
const prisma = require('../../config/prisma');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const user = await prisma.user.findUnique({ where: { email: token } });
        if (!user) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Authentication error.' });
    }
};

module.exports = authMiddleware;
