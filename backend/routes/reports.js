/**
 * Report Routes
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { generateReport, getReports, exportReport } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// All report routes require authentication + elevated access
router.use(authenticate);
router.use(authorize('admin', 'chief_editor', 'editor'));

// GET  /api/reports
router.get('/', getReports);

// POST /api/reports/generate
router.post(
  '/generate',
  [
    body('type')
      .notEmpty().withMessage('Report type is required.')
      .isIn(['daily','weekly','monthly','custom']).withMessage('Invalid report type.'),
    body('period_start')
      .notEmpty().withMessage('period_start is required.')
      .isDate().withMessage('period_start must be a valid date (YYYY-MM-DD).'),
    body('period_end')
      .notEmpty().withMessage('period_end is required.')
      .isDate().withMessage('period_end must be a valid date (YYYY-MM-DD).')
  ],
  generateReport
);

// GET /api/reports/:id/export?format=pdf|excel
router.get('/:id/export', exportReport);

module.exports = router;
