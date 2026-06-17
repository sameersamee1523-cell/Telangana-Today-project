/**
 * Global Error Handler Middleware
 * Centralised error handling for the Pipeline Server
 * Telangana Today Newspaper
 */

/**
 * errorHandler - Express error handling middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 * Handles various error types and returns consistent JSON error responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('=== ERROR HANDLER ===');
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
    console.error('=====================');
  } else {
    // In production, log a minimal error summary
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  // Default error values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected internal server error occurred.';

  // --- Handle specific error types ---

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists. Please use a unique value.';
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist. Check foreign key values.';
  }

  // MySQL cannot be null error
  if (err.code === 'ER_BAD_NULL_ERROR') {
    statusCode = 400;
    message = 'A required field is missing or null.';
  }

  // JSON parse errors (malformed request body)
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size exceeds the allowed limit of 10MB.';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field in upload request.';
  }

  // Build the error response object
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      code: err.code
    })
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
