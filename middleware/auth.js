const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from request header
  const token = req.header('x-auth-token');

  // Check if no token given
  if (!token) {
    return res.status(401).json({ msg: 'Access denied. No user authentication token.' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret')); // try to decode user ID from token with JWT secret
    req.user = decoded.user; // Add decoded user to request
    next(); // Continue to next function
  } catch (err) {
    res.status(401).json({ msg: 'Access denied. Token is not valid' });
  }
};
