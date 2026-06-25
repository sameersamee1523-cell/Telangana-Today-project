/**
 * Story Controller
 * Full CRUD for stories with status pipeline management
 * Telangana Today - Pipeline Server
 */

const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { paginate, generateAuditLog, sendNotification, getClientIp } = require('../utils/helpers');

// Valid status transitions map
const STATUS_TRANSITIONS = {
  draft:        ['assigned'],
  assigned:     ['in_progress', 'draft'],
  in_progress:  ['submitted', 'draft'],
  submitted:    ['under_review', 'in_progress'],
  under_review: ['approved', 'rejected', 'submitted'],
  approved:     ['published', 'under_review'],
  published:    [],
  rejected:     ['assigned', 'draft']
};

// ---------------------------------------------------------------
// GET /api/stories
// List stories with joins and filters
// ---------------------------------------------------------------
const getStories = async (req, res, next) => {
  try {
    const { status, priority, reporter_id, category_id, search, page, limit } = req.query;
    const { limit: lim, offset, page: pg } = paginate(page, limit);

    const params = [];
    const conditions = ['1=1'];

    // Role-based filtering: reporters only see their own stories
    if (req.user.role === 'reporter') {
      conditions.push('s.reporter_id = ?');
      params.push(req.user.id);
    }

    if (status)      { conditions.push('s.status = ?');      params.push(status); }
    if (priority)    { conditions.push('s.priority = ?');    params.push(priority); }
    if (reporter_id) { conditions.push('s.reporter_id = ?'); params.push(reporter_id); }
    if (category_id) { conditions.push('s.category_id = ?'); params.push(category_id); }
    if (search) {
      conditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    const [stories] = await pool.query(
      `SELECT s.id, s.title, s.description, s.location, s.priority, s.status,
              s.deadline, s.tags, s.views, s.created_at, s.updated_at,
              c.id AS category_id, c.name AS category_name, c.color AS category_color,
              r.id AS reporter_id, r.name AS reporter_name, r.avatar AS reporter_avatar,
              e.id AS editor_id, e.name AS editor_name,
              cb.name AS created_by_name
       FROM stories s
       LEFT JOIN categories c  ON s.category_id  = c.id
       LEFT JOIN users r       ON s.reporter_id   = r.id
       LEFT JOIN users e       ON s.editor_id     = e.id
       LEFT JOIN users cb      ON s.created_by    = cb.id
       WHERE ${whereClause}
       ORDER BY
         FIELD(s.priority,'urgent','high','medium','low'),
         s.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM stories s WHERE ${whereClause}`,
      params
    );

    return res.status(200).json({
      success: true,
      total,
      page: pg,
      limit: lim,
      stories
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/stories/kanban
// Stories grouped by status for Kanban board
// ---------------------------------------------------------------
const getKanbanStories = async (req, res, next) => {
  try {
    const params = [];
    const conditions = ['1=1'];

    if (req.user.role === 'reporter') {
      conditions.push('s.reporter_id = ?');
      params.push(req.user.id);
    }

    const whereClause = conditions.join(' AND ');

    const [stories] = await pool.query(
      `SELECT s.id, s.title, s.priority, s.status, s.deadline,
              c.name AS category_name, c.color AS category_color,
              r.name AS reporter_name, r.avatar AS reporter_avatar
       FROM stories s
       LEFT JOIN categories c ON s.category_id = c.id
       LEFT JOIN users r      ON s.reporter_id  = r.id
       WHERE ${whereClause}
       ORDER BY FIELD(s.priority,'urgent','high','medium','low'), s.updated_at DESC`,
      params
    );

    // Group by status
    const statuses = ['draft','assigned','in_progress','submitted','under_review','approved','published','rejected'];
    const kanban = {};
    statuses.forEach(s => { kanban[s] = []; });

    stories.forEach(story => {
      if (kanban[story.status]) {
        kanban[story.status].push(story);
      }
    });

    return res.status(200).json({ success: true, kanban });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/stories/:id
// Single story with all updates and attachments
// ---------------------------------------------------------------
const getStoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [stories] = await pool.query(
      `SELECT s.*,
              c.name AS category_name, c.color AS category_color,
              r.name AS reporter_name, r.email AS reporter_email, r.avatar AS reporter_avatar,
              e.name AS editor_name,   e.email AS editor_email,
              cb.name AS created_by_name
       FROM stories s
       LEFT JOIN categories c  ON s.category_id  = c.id
       LEFT JOIN users r       ON s.reporter_id   = r.id
       LEFT JOIN users e       ON s.editor_id     = e.id
       LEFT JOIN users cb      ON s.created_by    = cb.id
       WHERE s.id = ?`,
      [id]
    );

    if (!stories.length) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    const story = stories[0];

    // Reporters can only view their own stories
    if (req.user.role === 'reporter' && story.reporter_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Fetch status update history
    const [updates] = await pool.query(
      `SELECT su.*, u.name AS user_name, u.role AS user_role, u.avatar AS user_avatar
       FROM story_updates su
       JOIN users u ON su.user_id = u.id
       WHERE su.story_id = ?
       ORDER BY su.created_at ASC`,
      [id]
    );

    // Fetch attachments
    const [attachments] = await pool.query(
      `SELECT sa.*, u.name AS uploaded_by_name
       FROM story_attachments sa
       JOIN users u ON sa.uploaded_by = u.id
       WHERE sa.story_id = ?
       ORDER BY sa.created_at DESC`,
      [id]
    );

    // Increment view count
    await pool.query('UPDATE stories SET views = views + 1 WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      story,
      updates,
      attachments
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /api/stories
// Create a new story
// ---------------------------------------------------------------
const createStory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title, description, category_id, location,
      reporter_id, editor_id, priority, deadline, tags
    } = req.body;

    // Determine initial status based on assignment
    const status = reporter_id ? 'assigned' : 'draft';

    const [result] = await pool.query(
      `INSERT INTO stories
         (title, description, category_id, location, reporter_id, editor_id,
          priority, deadline, status, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        category_id || null,
        location || null,
        reporter_id || null,
        editor_id || null,
        priority || 'medium',
        deadline || null,
        status,
        tags ? JSON.stringify(tags) : null,
        req.user.id
      ]
    );

    const storyId = result.insertId;

    // Insert initial story_update record
    await pool.query(
      `INSERT INTO story_updates (story_id, user_id, old_status, new_status, comment)
       VALUES (?, ?, NULL, ?, ?)`,
      [storyId, req.user.id, status, `Story created by ${req.user.name}.`]
    );

    // If reporter assigned, send notification
    if (reporter_id) {
      await sendNotification(req.io, reporter_id, {
        type:    'story_assigned',
        title:   'New Story Assigned',
        message: `You have been assigned the story: "${title}". Priority: ${priority || 'medium'}.`,
        storyId
      });
    }

    // Audit log
    await generateAuditLog({
      userId:     req.user.id,
      action:     'CREATE_STORY',
      entityType: 'story',
      entityId:   storyId,
      details:    { title, status, reporter_id, priority },
      ipAddress:  getClientIp(req)
    });

    // Refresh dashboard for admins/editors
    if (req.io) {
      req.io.to('dashboard').emit('dashboard:refresh', { reason: 'story_created' });
    }

    const [newStory] = await pool.query('SELECT * FROM stories WHERE id = ?', [storyId]);
    return res.status(201).json({ success: true, message: 'Story created.', story: newStory[0] });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PUT /api/stories/:id
// Update story fields (general update)
// ---------------------------------------------------------------
const updateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, description, category_id, location,
      reporter_id, editor_id, priority, deadline, tags, comment
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM stories WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    const story = existing[0];

    // Reporters can only update their own stories
    if (req.user.role === 'reporter' && story.reporter_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own stories.' });
    }

    const updates = [];
    const values  = [];

    if (title !== undefined)       { updates.push('title = ?');       values.push(title.trim()); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (location !== undefined)    { updates.push('location = ?');    values.push(location); }
    if (priority !== undefined)    { updates.push('priority = ?');    values.push(priority); }
    if (deadline !== undefined)    { updates.push('deadline = ?');    values.push(deadline); }
    if (tags !== undefined)        { updates.push('tags = ?');        values.push(JSON.stringify(tags)); }

    // Only admin/chief_editor/editor can reassign reporter or editor
    if (['admin','chief_editor','editor'].includes(req.user.role)) {
      if (reporter_id !== undefined) { updates.push('reporter_id = ?'); values.push(reporter_id); }
      if (editor_id !== undefined)   { updates.push('editor_id = ?');   values.push(editor_id); }
    }

    if (updates.length) {
      values.push(id);
      await pool.query(`UPDATE stories SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Create update record for comment or reassignment
    if (comment || reporter_id !== undefined) {
      await pool.query(
        `INSERT INTO story_updates (story_id, user_id, old_status, new_status, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [id, req.user.id, story.status, story.status, comment || 'Story details updated.']
      );
    }

    // Notify reporter if reassigned
    if (reporter_id && reporter_id !== story.reporter_id) {
      await sendNotification(req.io, reporter_id, {
        type:    'story_assigned',
        title:   'Story Assigned to You',
        message: `You have been assigned the story: "${story.title}".`,
        storyId: parseInt(id)
      });
    }

    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_STORY',
      entityType: 'story',
      entityId:   parseInt(id),
      details:    { updatedFields: Object.keys(req.body) },
      ipAddress:  getClientIp(req)
    });

    const [updated] = await pool.query('SELECT * FROM stories WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Story updated.', story: updated[0] });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// DELETE /api/stories/:id
// Admin/chief_editor only
// ---------------------------------------------------------------
const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, title FROM stories WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    await pool.query('DELETE FROM stories WHERE id = ?', [id]);

    await generateAuditLog({
      userId:     req.user.id,
      action:     'DELETE_STORY',
      entityType: 'story',
      entityId:   parseInt(id),
      details:    { title: existing[0].title },
      ipAddress:  getClientIp(req)
    });

    if (req.io) {
      req.io.to('dashboard').emit('dashboard:refresh', { reason: 'story_deleted' });
    }

    return res.status(200).json({ success: true, message: 'Story deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// PATCH /api/stories/:id/status
// Transition story status with validation
// ---------------------------------------------------------------
const updateStoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus, comment } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'New status is required.' });
    }

    const [existing] = await pool.query(
      `SELECT s.*, r.name AS reporter_name, e.name AS editor_name
       FROM stories s
       LEFT JOIN users r ON s.reporter_id = r.id
       LEFT JOIN users e ON s.editor_id   = e.id
       WHERE s.id = ?`,
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    const story = existing[0];
    const oldStatus = story.status;

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[oldStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${oldStatus}" to "${newStatus}". Allowed: [${allowedTransitions.join(', ')}].`
      });
    }

    // Role-based transition permissions
    const isReporter = req.user.role === 'reporter';
    const isEditor   = ['editor','chief_editor','admin'].includes(req.user.role);

    // Reporter can only move: assigned→in_progress, in_progress→submitted
    if (isReporter) {
      if (!['in_progress','submitted'].includes(newStatus)) {
        return res.status(403).json({ success: false, message: 'Reporters can only move stories to in_progress or submitted.' });
      }
      if (story.reporter_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only update your own stories.' });
      }
    }

    // Update the story status
    await pool.query('UPDATE stories SET status = ? WHERE id = ?', [newStatus, id]);

    // Record the status change
    await pool.query(
      `INSERT INTO story_updates (story_id, user_id, old_status, new_status, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, oldStatus, newStatus, comment || null]
    );

    // Send notifications based on the new status
    const storyTitle = story.title;

    if (newStatus === 'in_progress' && story.editor_id) {
      await sendNotification(req.io, story.editor_id, {
        type:    'status_changed',
        title:   'Story In Progress',
        message: `Reporter started working on: "${storyTitle}".`,
        storyId: parseInt(id)
      });
    }

    if (newStatus === 'submitted' && story.editor_id) {
      await sendNotification(req.io, story.editor_id, {
        type:    'story_submitted',
        title:   'Story Submitted for Review',
        message: `"${storyTitle}" has been submitted for review by ${story.reporter_name}.`,
        storyId: parseInt(id)
      });
    }

    if (newStatus === 'approved' && story.reporter_id) {
      await sendNotification(req.io, story.reporter_id, {
        type:    'status_changed',
        title:   'Story Approved',
        message: `Your story "${storyTitle}" has been approved and will be published soon.`,
        storyId: parseInt(id)
      });
    }

    if (newStatus === 'published' && story.reporter_id) {
      await sendNotification(req.io, story.reporter_id, {
        type:    'status_changed',
        title:   'Story Published! 🎉',
        message: `Your story "${storyTitle}" is now live!`,
        storyId: parseInt(id)
      });
    }

    if (newStatus === 'rejected' && story.reporter_id) {
      await sendNotification(req.io, story.reporter_id, {
        type:    'story_rejected',
        title:   'Story Rejected',
        message: `Your story "${storyTitle}" was rejected. ${comment ? 'Feedback: ' + comment : 'Please check the comments.'}`,
        storyId: parseInt(id)
      });
    }

    // Emit story update to socket rooms
    if (req.io) {
      req.io.to(`story_${id}`).emit('story:update', {
        storyId:   parseInt(id),
        title:     storyTitle,
        oldStatus,
        newStatus,
        updatedBy: req.user.name,
        comment
      });
      req.io.to('dashboard').emit('dashboard:refresh', { reason: 'status_changed' });
    }

    // Audit log
    await generateAuditLog({
      userId:     req.user.id,
      action:     'UPDATE_STATUS',
      entityType: 'story',
      entityId:   parseInt(id),
      details:    { oldStatus, newStatus, comment },
      ipAddress:  getClientIp(req)
    });

    return res.status(200).json({
      success: true,
      message: `Story status updated from "${oldStatus}" to "${newStatus}".`,
      oldStatus,
      newStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStories,
  getKanbanStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  updateStoryStatus
};
