// Placeholder authentication middleware
function authenticateToken(req, res, next) {
  // In production, check JWT or session here
  next();
}

// Placeholder admin check middleware
function isAdmin(req, res, next) {
  // In production, check user role here
  next();
}

module.exports = { authenticateToken, isAdmin }; 