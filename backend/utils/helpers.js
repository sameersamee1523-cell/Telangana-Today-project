/**
 * Helper Utilities
 * Shared utility functions for the Pipeline Server
 * Telangana Today Newspaper
 */

const pool = require('../config/db');

/**
 * formatDate - Formats a JavaScript Date object to a readable string.
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default: 'en-IN' for India)
 * @returns {string} Human-readable date string
 */
const formatDate = (date, locale = 'en-IN') => {
  if (!date) return null;
  return new Date(date).toLocaleString(locale, {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * paginate - Computes SQL LIMIT/OFFSET values from page and limit query params.
 * @param {number|string} page  - Current page number (1-indexed)
 * @param {number|string} limit - Items per page
 * @returns {{ limit: number, offset: number, page: number }} Pagination object
 */
const paginate = (page = 1, limit = 20) => {
  const parsedPage  = Math.max(1, parseInt(page, 10)  || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20)); // cap at 100
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page:   parsedPage,
    limit:  parsedLimit,
    offset
  };
};

/**
 * generateAuditLog - Inserts an audit log record into the audit_logs table.
 * @param {Object} params
 * @param {number}        params.userId     - ID of the user performing the action
 * @param {string}        params.action     - Action name (e.g., 'CREATE_STORY')
 * @param {string}        params.entityType - Entity type (e.g., 'story', 'user')
 * @param {number}        params.entityId   - ID of the affected entity
 * @param {Object}        params.details    - Additional details (stored as JSON)
 * @param {string}        params.ipAddress  - IP address of the requester
 * @returns {Promise<void>}
 */
const generateAuditLog = async ({
  userId,
  action,
  entityType,
  entityId,
  details = {},
  ipAddress = '0.0.0.0'
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, JSON.stringify(details), ipAddress]
    );
  } catch (err) {
    // Audit log failures should not crash the request — just log to console
    console.error('[AuditLog Error]', err.message);
  }
};

/**
 * sendNotification - Creates a notification in the DB and emits a real-time
 *                    Socket.io event to the target user's room.
 *
 * @param {import('socket.io').Server} io        - Socket.io server instance
 * @param {number}                     userId    - Target user's ID
 * @param {Object}                     notification
 * @param {string}                     notification.type    - Notification type key
 * @param {string}                     notification.title   - Short title
 * @param {string}                     notification.message - Full message body
 * @param {number|null}                [notification.storyId] - Related story ID (optional)
 * @returns {Promise<Object>} The created notification object
 */
const sendNotification = async (io, userId, { type, title, message, storyId = null }) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, story_id, is_read)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, type, title, message, storyId]
    );

    const notification = {
      id: result.insertId,
      user_id: userId,
      type,
      title,
      message,
      story_id: storyId,
      is_read: false,
      created_at: new Date()
    };

    // Emit to the user's dedicated socket room (joined on connection)
    if (io) {
      io.to(`user_${userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (err) {
    console.error('[SendNotification Error]', err.message);
    return null;
  }
};

/**
 * getClientIp - Extracts the real client IP from a request object,
 *               considering common proxy headers.
 * @param {import('express').Request} req
 * @returns {string}
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.ip ||
    '0.0.0.0'
  );
};

module.exports = {
  formatDate,
  paginate,
  generateAuditLog,
  sendNotification,
  getClientIp
};
