/**
 * Auth Routes
 * POST /api/auth/login
 * POST /api/auth/register
 * GET  /api/auth/me
 * PATCH /api/auth/update-password
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { login, register, getMe, updatePassword, forgotPassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// ---------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.')
  ],
  login
);

// ---------------------------------------------------------------
// POST /api/auth/register
// Admin / chief_editor only - add a new user account
// ---------------------------------------------------------------
router.post(
  '/register',
  authenticate,
  authorize('admin', 'chief_editor'),
  [
    body('name')
      .trim().notEmpty().withMessage('Name is required.')
      .isLength({ max: 150 }).withMessage('Name must be at most 150 characters.'),
    body('email')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
    body('role')
      .optional()
      .isIn(['admin','chief_editor','editor','reporter','photographer']).withMessage('Invalid role.'),
    body('department_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid department ID.')
  ],
  register
);

// ---------------------------------------------------------------
// GET /api/auth/me
// Returns the authenticated user's profile
// ---------------------------------------------------------------
router.get('/me', authenticate, getMe);

// ---------------------------------------------------------------
// PATCH /api/auth/update-password
// ---------------------------------------------------------------
router.patch(
  '/update-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter.')
      .matches(/[0-9]/).withMessage('Must contain at least one number.')
  ],
  updatePassword
);

// ---------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------
router.post(
  '/forgot-password',
  [
    body('loginId').notEmpty().withMessage('Employee ID or Email is required.').trim()
  ],
  forgotPassword
);

module.exports = router;
