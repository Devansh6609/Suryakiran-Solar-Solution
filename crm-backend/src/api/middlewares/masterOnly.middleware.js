
const masterOnlyMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'Master') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Master role required.' });
    }
};

module.exports = masterOnlyMiddleware;
