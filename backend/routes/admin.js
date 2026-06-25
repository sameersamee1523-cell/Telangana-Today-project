/**
 * Admin Routes
 * Audit logs, departments, categories management
 * Admin / chief_editor only
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAuditLogs,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/adminController');

const { authenticate, authorize } = require('../middleware/auth');

// All admin routes: authenticate + admin or chief_editor
router.use(authenticate);
router.use(authorize('admin', 'chief_editor'));

// ---------------------------------------------------------------
// AUDIT LOGS
// ---------------------------------------------------------------
router.get('/audit-logs', getAuditLogs);

// ---------------------------------------------------------------
// DEPARTMENTS
// ---------------------------------------------------------------
router.get('/departments', getDepartments);

router.post(
  '/departments',
  [
    body('name').trim().notEmpty().withMessage('Department name is required.')
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.')
  ],
  createDepartment
);

router.put(
  '/departments/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.')
  ],
  updateDepartment
);

router.delete('/departments/:id', deleteDepartment);

// ---------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------
router.get('/categories', getCategories);

router.post(
  '/categories',
  [
    body('name').trim().notEmpty().withMessage('Category name is required.')
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code (e.g. #E11D48).')
  ],
  createCategory
);

router.put(
  '/categories/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code.')
  ],
  updateCategory
);

router.delete('/categories/:id', deleteCategory);

module.exports = router;
