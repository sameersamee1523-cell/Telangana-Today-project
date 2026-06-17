/**
 * Analytics Routes
 * All require authentication; some require elevated roles
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const router = express.Router();

const {
  getReporterPerformance,
  getCompletionRate,
  getDeadlineCompliance,
  getCategoryWise,
  getMonthlyProductivity,
  getDashboardStats
} = require('../controllers/analyticsController');

const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticate);

// GET /api/analytics/dashboard-stats - available to all roles
router.get('/dashboard-stats', getDashboardStats);

// GET /api/analytics/reporter-performance
router.get(
  '/reporter-performance',
  authorize('admin', 'chief_editor', 'editor'),
  getReporterPerformance
);

// GET /api/analytics/completion-rate
router.get(
  '/completion-rate',
  authorize('admin', 'chief_editor', 'editor'),
  getCompletionRate
);

// GET /api/analytics/deadline-compliance
router.get(
  '/deadline-compliance',
  authorize('admin', 'chief_editor', 'editor'),
  getDeadlineCompliance
);

// GET /api/analytics/category-wise
router.get(
  '/category-wise',
  authorize('admin', 'chief_editor', 'editor', 'reporter'),
  getCategoryWise
);

// GET /api/analytics/monthly-productivity
router.get(
  '/monthly-productivity',
  authorize('admin', 'chief_editor', 'editor', 'reporter'),
  getMonthlyProductivity
);

module.exports = router;
