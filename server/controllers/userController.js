/**
 * User Controller
 * Full CRUD for users with role filtering, search, and stats
 * Telangana Today - Pipeline Server
 */

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { paginate, generateAuditLog, getClientIp } = require('../utils/helpers');

// ---------------------------------------------------------------
// GET /api/users
// List all users with optional ?role= and ?search= filters
// ---------------------------------------------------------------
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    const params = [];
    const conditions = ['1=1'];

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.phone, u.is_active,
              u.created_at, u.last_login, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u WHERE ${whereClause}`,
      params
    );

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page) || 1,
      limit: lim,
      users
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/users/:id
// Single user with story count stats by status
// ---------------------------------------------------------------
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.phone, u.bio,
              u.is_active, u.created_at, u.updated_at, u.last_login,
              d.name AS department_name, d.id AS department_id
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch story stats grouped by status for this user (as reporter)
    const [stats] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM stories
       WHERE reporter_id = ?
       GROUP BY status`,
      [id]
    );

    // Build stats object with defaults
    const storyStats = {
      draft:        0,
      assigned:     0,
      in_progress:  0,
      submitted:    0,
      under_review: 0,
      approved:     0,
      published:    0,
      rejected:     0
    };

    stats.forEach(({ status, count }) => {
      storyStats[status] = count;
    });

    storyStats.total = Object.values(storyStats).reduce((a, b) => a + b, 0);

    return res.status(200).json({
      success: true,
      user: rows[0],
      storyStats
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /api/users
// Admin only - create a new user
// ---------------------------------------------------------------
const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, department_id, phone, bio } = req.body;

    // Check for duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department_id, phone, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role || 'reporter', department_id || null, phone || null, bio || null]
    );

    await generateAuditLog({
      userId:     req.user.id,
      action:     'CREATE_USER',
      entityType: 'user',
      entityId:   result.insertId,
      details:    { name, email, role },
      ipAddress:  getClientIp(req)
    });

    const [newUser] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.is_active, u.created_at,
              d.name AS department_name
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: newUser[0]
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PUT /api/users/:id
// Update user fields
// ---------------------------------------------------------------
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, department_id, phone, bio, avatar } = req.body;

    // Reporters can only update their own profile
    if (req.user.role === 'reporter' && parseInt(id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
    }

    // Editors can only update their own profile too
    if (req.user.role === 'editor' && parseInt(id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Only admin/chief_editor can change roles
    const updates = [];
    const values = [];

    if (name)          { updates.push('name = ?');          values.push(name.trim()); }
    if (email)         { updates.push('email = ?');         values.push(email.toLowerCase().trim()); }
    if (phone !== undefined) { updates.push('phone = ?');   values.push(phone); }
    if (bio !== undefined)   { updates.push('bio = ?');     values.push(bio); }
    if (avatar !== undefined){ updates.push('avatar = ?');  values.push(avatar); }
    if (department_id !== undefined) { updates.push('department_id = ?'); values.push(department_id); }

    // Only admins can change roles
    if (role && ['admin', 'chief_editor'].includes(req.user.role)) {
      updates.push('role = ?');
      values.push(role);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_USER',
      entityType: 'user',
      entityId:   parseInt(id),
      details:    { updatedFields: Object.keys(req.body) },
      ipAddress:  getClientIp(req)
    });

    const [updated] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.phone, u.bio,
              u.is_active, u.created_at, d.name AS department_name
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, message: 'User updated.', user: updated[0] });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// DELETE /api/users/:id
// Soft delete (set is_active = false)
// ---------------------------------------------------------------
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    const [existing] = await pool.query('SELECT id, name FROM users WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'DEACTIVATE_USER',
      entityType: 'user',
      entityId:   parseInt(id),
      details:    { name: existing[0].name },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/users/reporters
// List only reporters (for assignment dropdowns)
// ---------------------------------------------------------------
const getReporters = async (req, res, next) => {
  try {
    const [reporters] = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, u.phone,
              d.name AS department_name,
              COUNT(s.id) AS active_stories
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN stories s ON s.reporter_id = u.id AND s.status NOT IN ('published','rejected')
       WHERE u.role = 'reporter' AND u.is_active = 1
       GROUP BY u.id
       ORDER BY u.name ASC`
    );

    return res.status(200).json({ success: true, reporters });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getReporters };
