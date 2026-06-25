/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 * Telangana Today - Pipeline Server
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * authenticate - Verifies Bearer JWT token from Authorization header.
 * Attaches the decoded user object to req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and is Bearer format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authentication failed.'
      });
    }

    // Fetch fresh user data from DB to ensure user is still active
    const [rows] = await pool.query(
      'SELECT id, name, email, role, department_id, avatar, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact your administrator.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * authorize - Role-based access control factory.
 * Returns middleware that checks if req.user.role is in the allowed roles array.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'chief_editor')
 * @returns Express middleware function
 *
 * @example
 *   router.delete('/:id', authenticate, authorize('admin', 'chief_editor'), deleteStory);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required roles: [${roles.join(', ')}]. Your role: ${req.user.role}.`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
