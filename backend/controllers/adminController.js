/**
 * Admin Controller
 * Audit logs, departments, and categories management
 * Telangana Today - Pipeline Server
 */

const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { paginate, generateAuditLog, getClientIp } = require('../utils/helpers');

// ==============================================================
// AUDIT LOGS
// ==============================================================

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity_type, user_id, page, limit: lim } = req.query;
    const { limit, offset, page: pg } = paginate(page, lim);

    const conditions = ['1=1'];
    const params = [];

    if (action)      { conditions.push('al.action = ?');      params.push(action); }
    if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type); }
    if (user_id)     { conditions.push('al.user_id = ?');     params.push(user_id); }

    const whereClause = conditions.join(' AND ');

    const [logs] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
              al.ip_address, al.created_at,
              u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM audit_logs al WHERE ${whereClause}`,
      params
    );

    return res.status(200).json({ success: true, total, page: pg, limit, logs });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// DEPARTMENTS
// ==============================================================

// GET /api/admin/departments
const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.id, d.name, d.description, d.created_at, d.updated_at, COUNT(u.id) AS user_count
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id AND u.is_active = 1
       GROUP BY d.id, d.name, d.description, d.created_at, d.updated_at
       ORDER BY d.name ASC`
    );
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/departments
const createDepartment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description } = req.body;

    const [result] = await pool.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );

    await generateAuditLog({
      userId:     req.user.id,
      action:     'CREATE_DEPARTMENT',
      entityType: 'department',
      entityId:   result.insertId,
      details:    { name },
      ipAddress:  getClientIp(req)
    });

    const [dept] = await pool.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Department created.', department: dept[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const updates = [];
    const values = [];
    if (name)        { updates.push('name = ?');        values.push(name.trim()); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields provided.' });
    }

    values.push(id);
    await pool.query(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, values);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_DEPARTMENT',
      entityType: 'department',
      entityId:   parseInt(id),
      details:    { name, description },
      ipAddress:  getClientIp(req)
    });

    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Department updated.', department: updated[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name FROM departments WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Check if any users belong to this department
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE department_id = ? AND is_active = 1',
      [id]
    );

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${count} active user(s). Reassign users first.`
      });
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'DELETE_DEPARTMENT',
      entityType: 'department',
      entityId:   parseInt(id),
      details:    { name: existing[0].name },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({ success: true, message: 'Department deleted.' });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// CATEGORIES
// ==============================================================

// GET /api/admin/categories
const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.id, c.name, c.color, c.description, c.created_at, c.updated_at, COUNT(s.id) AS story_count
       FROM categories c
       LEFT JOIN stories s ON s.category_id = c.id
       GROUP BY c.id, c.name, c.color, c.description, c.created_at, c.updated_at
       ORDER BY c.name ASC`
    );
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, color, description } = req.body;

    const [result] = await pool.query(
      'INSERT INTO categories (name, color, description) VALUES (?, ?, ?)',
      [name.trim(), color || '#6B7280', description || null]
    );

    await generateAuditLog({
      userId:     req.user.id,
      action:     'CREATE_CATEGORY',
      entityType: 'category',
      entityId:   result.insertId,
      details:    { name, color },
      ipAddress:  getClientIp(req)
    });

    const [cat] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Category created.', category: cat[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updates = [];
    const values = [];
    if (name)        { updates.push('name = ?');        values.push(name.trim()); }
    if (color)       { updates.push('color = ?');       values.push(color); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields provided.' });
    }

    values.push(id);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_CATEGORY',
      entityType: 'category',
      entityId:   parseInt(id),
      details:    { name, color, description },
      ipAddress:  getClientIp(req)
    });

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Category updated.', category: updated[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if category has stories
    const [[{ story_count }]] = await pool.query(
      'SELECT COUNT(*) AS story_count FROM stories WHERE category_id = ?',
      [id]
    );

    if (story_count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${story_count} associated story/stories. Reassign stories first.`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'DELETE_CATEGORY',
      entityType: 'category',
      entityId:   parseInt(id),
      details:    { name: existing[0].name },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
