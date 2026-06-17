/**
 * Multer File Upload Middleware
 * Handles multipart/form-data file uploads for story attachments
 * Telangana Today - Pipeline Server
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists at server root
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------------------------------------------------------
// Storage Engine: DiskStorage
// Files are stored in uploads/<story_id>/ or uploads/general/
// ---------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise uploads by story if story_id is available
    const storyId = req.params.id || req.body.story_id;
    const dir = storyId
      ? path.join(UPLOAD_DIR, `story_${storyId}`)
      : path.join(UPLOAD_DIR, 'general');

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    // Generate a unique filename: timestamp-randomhex-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_') // sanitize
      .substring(0, 50); // truncate to prevent very long filenames

    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

// ---------------------------------------------------------------
// File Filter: Allow images, PDF, DOC, DOCX only
// ---------------------------------------------------------------
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',                                                      // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  // .docx
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP), PDF, DOC, and DOCX are allowed.'), {
        statusCode: 400
      }),
      false
    );
  }
};

// ---------------------------------------------------------------
// Multer Upload Instance
// ---------------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 5                    // Max 5 files per request
  }
});

module.exports = upload;
