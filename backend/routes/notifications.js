/**
 * Notification Routes
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification
} = require('../controllers/notificationController');

const { authenticate } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticate);

// GET  /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all - must be before /:id
router.patch('/read-all', markAllRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markRead);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

module.exports = router;
