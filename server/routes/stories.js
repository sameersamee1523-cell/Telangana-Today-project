/**
 * Story Routes
 * All routes require authentication
 * Telangana Today - Pipeline Server
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getStories,
  getKanbanStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  updateStoryStatus
} = require('../controllers/storyController');

const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All story routes require authentication
router.use(authenticate);

// GET /api/stories/kanban - Kanban grouped view (must be before /:id)
router.get('/kanban', getKanbanStories);

// GET /api/stories
router.get('/', getStories);

// GET /api/stories/:id
router.get('/:id', getStoryById);

// POST /api/stories
router.post(
  '/',
  authorize('admin', 'chief_editor', 'editor'),
  [
    body('title')
      .trim().notEmpty().withMessage('Story title is required.')
      .isLength({ max: 500 }).withMessage('Title cannot exceed 500 characters.'),
    body('priority')
      .optional()
      .isIn(['low','medium','high','urgent']).withMessage('Invalid priority level.'),
    body('deadline')
      .optional()
      .isISO8601().withMessage('Deadline must be a valid date.'),
    body('reporter_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid reporter ID.'),
    body('editor_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid editor ID.'),
    body('category_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid category ID.')
  ],
  createStory
);

// PUT /api/stories/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('priority')
      .optional()
      .isIn(['low','medium','high','urgent']).withMessage('Invalid priority.'),
    body('deadline')
      .optional()
      .isISO8601().withMessage('Invalid deadline format.')
  ],
  updateStory
);

// PATCH /api/stories/:id/status - Status transition
router.patch(
  '/:id/status',
  [
    body('status')
      .notEmpty().withMessage('New status is required.')
      .isIn(['draft','assigned','in_progress','submitted','under_review','approved','published','rejected'])
      .withMessage('Invalid status value.')
  ],
  updateStoryStatus
);

// DELETE /api/stories/:id - admin/chief_editor only
router.delete('/:id', authorize('admin', 'chief_editor'), deleteStory);

// POST /api/stories/:id/attachments - Upload files
router.post(
  '/:id/attachments',
  upload.array('files', 5),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const pool = require('../config/db');

      if (!req.files || !req.files.length) {
        return res.status(400).json({ success: false, message: 'No files uploaded.' });
      }

      const insertions = req.files.map(f => [
        id,
        f.filename,
        f.originalname,
        f.path.replace(/\\/g, '/'),
        f.size,
        f.mimetype,
        req.user.id
      ]);

      await pool.query(
        `INSERT INTO story_attachments
           (story_id, filename, original_name, filepath, filesize, mimetype, uploaded_by)
         VALUES ?`,
        [insertions]
      );

      return res.status(201).json({
        success: true,
        message: `${req.files.length} file(s) uploaded successfully.`,
        files: req.files.map(f => ({
          filename:      f.filename,
          original_name: f.originalname,
          filesize:      f.size,
          mimetype:      f.mimetype
        }))
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
