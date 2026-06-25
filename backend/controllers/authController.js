/**
 * Auth Controller
 * Handles login, register, getMe, updatePassword
 * Telangana Today - Pipeline Server
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { generateAuditLog, getClientIp } = require('../utils/helpers');

// ---------------------------------------------------------------
// Helper: sign JWT token
// ---------------------------------------------------------------
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// ---------------------------------------------------------------
// Helper: Build safe user response (no password)
// ---------------------------------------------------------------
const buildUserResponse = (user) => ({
  id:            user.id,
  name:          user.name,
  email:         user.email,
  role:          user.role,
  department_id: user.department_id,
  avatar:        user.avatar,
  phone:         user.phone,
  bio:           user.bio,
  is_active:     user.is_active,
  created_at:    user.created_at
});

// ---------------------------------------------------------------
// Role passwords — entering one of these with any email
// automatically identifies the role and creates the account
// ---------------------------------------------------------------
const ROLE_PASSWORDS = {
  'Admin@123':    'admin',
  'Chief@123':    'chief_editor',
  'Editor@123':   'editor',
  'Reporter@123': 'reporter',
  'Photo@123':    'photographer',
};

// ---------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------
const login = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // Find user by email
    let [rows] = await pool.query(
      `SELECT u.*, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = ?`,
      [cleanEmail]
    );

    // ── NEW USER: auto-create if role password matches ──────────
    if (!rows.length) {
      const detectedRole = ROLE_PASSWORDS[password];
      if (!detectedRole) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Hash the role password and create account
      const password_hash = await bcrypt.hash(password, 12);
      // Derive a display name from the email (part before @)
      const namePart = cleanEmail.split('@')[0];
      const name = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');

      const [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_active, last_login)
         VALUES (?, ?, ?, ?, 1, NOW())`,
        [name, cleanEmail, password_hash, detectedRole]
      );

      // Fetch the new user
      const [newRows] = await pool.query(
        `SELECT u.*, d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.id = ?`,
        [result.insertId]
      );

      const newUser = newRows[0];
      const token = signToken(newUser.id);

      await generateAuditLog({
        userId:     newUser.id,
        action:     'AUTO_REGISTER_LOGIN',
        entityType: 'user',
        entityId:   newUser.id,
        details:    { email: newUser.email, role: detectedRole },
        ipAddress:  getClientIp(req)
      });

      return res.status(200).json({
        success: true,
        message: `Account created and logged in as ${detectedRole.replace('_', ' ')}.`,
        token,
        user: buildUserResponse(newUser)
      });
    }

    // ── EXISTING USER ───────────────────────────────────────────
    const user = rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact your administrator.'
      });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last_login timestamp
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Sign JWT
    const token = signToken(user.id);

    // Audit log
    await generateAuditLog({
      userId:     user.id,
      action:     'LOGIN',
      entityType: 'user',
      entityId:   user.id,
      details:    { email: user.email },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};


// ---------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { employee_id, name, email, password, role, department_id, phone, bio } = req.body;

    // Check if email or employee_id already exists
    let duplicateQuery = 'SELECT id FROM users WHERE email = ?';
    let duplicateParams = [email.toLowerCase().trim()];
    if (employee_id) {
       duplicateQuery += ' OR employee_id = ?';
       duplicateParams.push(employee_id.trim());
    }
    const [existing] = await pool.query(duplicateQuery, duplicateParams);
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: 'Email or Employee ID is already registered.'
      });
    }

    // Hash password with bcrypt (cost factor 12)
    const password_hash = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (employee_id, name, email, password_hash, role, department_id, phone, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id ? employee_id.trim() : null,
        name.trim(),
        email.toLowerCase().trim(),
        password_hash,
        role || 'reporter',
        department_id || null,
        phone || null,
        bio || null
      ]
    );

    const userId = result.insertId;

    // Fetch the newly created user
    const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    // Sign JWT
    const token = signToken(userId);

    // Audit log
    await generateAuditLog({
      userId:     userId,
      action:     'REGISTER',
      entityType: 'user',
      entityId:   userId,
      details:    { email, role: role || 'reporter' },
      ipAddress:  getClientIp(req)
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: buildUserResponse(newUser[0])
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------
const getMe = async (req, res, next) => {
  try {
    // Fetch fresh data with department info
    const [rows] = await pool.query(
      `SELECT u.*, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: buildUserResponse(rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PATCH /api/auth/update-password
// ---------------------------------------------------------------
const updatePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch the current user's password hash
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Ensure new password is different from the old one
    const isSame = await bcrypt.compare(newPassword, rows[0].password_hash);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as the current password.'
      });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    // Audit log
    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_PASSWORD',
      entityType: 'user',
      entityId:   req.user.id,
      details:    { email: req.user.email },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------
const forgotPassword = async (req, res, next) => {
  try {
    const { loginId } = req.body;
    
    // Find user by email or employee_id
    const [rows] = await pool.query(
      `SELECT id, email FROM users WHERE email = ? OR employee_id = ?`,
      [loginId.toLowerCase().trim(), loginId.trim()]
    );

    // Always return success to prevent user enumeration
    if (!rows.length) {
      return res.status(200).json({
        success: true,
        message: 'If an account matches that ID or email, a reset link has been sent.'
      });
    }

    // Mock email sending
    console.log(`[MOCK EMAIL] Password reset requested for user: ${rows[0].email}`);

    return res.status(200).json({
      success: true,
      message: 'If an account matches that ID or email, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe, updatePassword, forgotPassword };
