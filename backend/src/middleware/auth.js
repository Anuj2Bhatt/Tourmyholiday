const jwt = require('jsonwebtoken');

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT secret exists
if (!JWT_SECRET) {
    process.exit(1);
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Authentication token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token has expired' 
                });
            }
            return res.status(403).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken
}; 