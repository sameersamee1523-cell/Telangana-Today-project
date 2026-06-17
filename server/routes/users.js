/**
 * User Routes
 * All routes require authentication
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getReporters
} = require('../controllers/userController');

const { authenticate, authorize } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// GET /api/users/reporters - for assignment dropdowns
router.get('/reporters', getReporters);

// GET /api/users
router.get('/', authorize('admin', 'chief_editor', 'editor'), getUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

// POST /api/users - admin/chief_editor only
router.post(
  '/',
  authorize('admin', 'chief_editor'),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Must have an uppercase letter.')
      .matches(/[0-9]/).withMessage('Must have a number.'),
    body('role')
      .optional()
      .isIn(['admin','chief_editor','editor','reporter']).withMessage('Invalid role.')
  ],
  createUser
);

// PUT /api/users/:id
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('email').optional().isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
    body('role')
      .optional()
      .isIn(['admin','chief_editor','editor','reporter']).withMessage('Invalid role.')
  ],
  updateUser
);

// DELETE /api/users/:id - admin only (soft delete)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
