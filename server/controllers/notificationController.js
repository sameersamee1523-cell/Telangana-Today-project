/**
 * Notification Controller
 * Per-user notification management
 * Telangana Today - Pipeline Server
 */

const pool = require('../config/db');

// ---------------------------------------------------------------
// GET /api/notifications
// Get authenticated user's notifications with unread count
// ---------------------------------------------------------------
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 30, offset = 0 } = req.query;

    const [notifications] = await pool.query(
      `SELECT n.*, s.title AS story_title
       FROM notifications n
       LEFT JOIN stories s ON n.story_id = s.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [[{ unread_count }]] = await pool.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      total,
      unread_count,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PATCH /api/notifications/:id/read
// Mark a single notification as read
// ---------------------------------------------------------------
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PATCH /api/notifications/read-all
// Mark all notifications as read for the authenticated user
// ---------------------------------------------------------------
const markAllRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// DELETE /api/notifications/:id
// Delete a notification
// ---------------------------------------------------------------
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, req.user.id]);

    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
