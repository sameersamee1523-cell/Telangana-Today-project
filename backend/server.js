/**
 * ============================================================
 * TELANGANA TODAY - Reporter Assignment & Story Pipeline Manager
 * Main Server Entry Point
 * ============================================================
 *
 * Architecture:
 *  - Express REST API
 *  - MySQL2 (promise pool)
 *  - Socket.io for real-time events
 *  - JWT authentication
 *  - Helmet, CORS, Morgan security/logging middleware
 *
 * Routes mounted at /api/:
 *   /api/auth          - Authentication
 *   /api/users         - User management
 *   /api/stories       - Story CRUD & pipeline
 *   /api/notifications - User notifications
 *   /api/analytics     - Reporting & metrics
 *   /api/reports       - Export reports
 *   /api/admin         - Admin management
 */

require('dotenv').config();

const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const path        = require('path');

const pool          = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');
const { initSocket } = require('./sockets/handlers');

// ---------------------------------------------------------------
// Route imports
// ---------------------------------------------------------------
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const storyRoutes        = require('./routes/stories');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes    = require('./routes/analytics');
const reportRoutes       = require('./routes/reports');
const adminRoutes        = require('./routes/admin');

// ---------------------------------------------------------------
// App & Server Initialization
// ---------------------------------------------------------------
const app    = express();
const server = http.createServer(app);

// ---------------------------------------------------------------
// Socket.io Setup
// ---------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout:  60000,
  pingInterval: 25000
});

// Initialize socket event handlers
initSocket(io);

// ---------------------------------------------------------------
// Attach io to every request so controllers can emit events
// ---------------------------------------------------------------
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ---------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // allow static uploads to be served cross-origin
  })
);

// ---------------------------------------------------------------
// CORS
// ---------------------------------------------------------------
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ];
    // Allow requests with no origin (e.g. server-to-server, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

// ---------------------------------------------------------------
// Request Logging
// ---------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ---------------------------------------------------------------
// Body Parsers
// ---------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------
// Static File Serving - Uploads folder
// ---------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    // Ping the database
    await pool.query('SELECT 1');
    res.status(200).json({
      success: true,
      status:  'ok',
      service: 'Telangana Today - Pipeline Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      success:  false,
      status:   'error',
      database: 'disconnected',
      error:    err.message
    });
  }
});

// ---------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/stories',       storyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/admin',         adminRoutes);

// ---------------------------------------------------------------
// 404 Handler - Catch unmatched routes
// ---------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the API endpoint.'
  });
});

// ---------------------------------------------------------------
// Global Error Handler (must be LAST middleware)
// ---------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------
const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async () => {
  try {
    // Verify database connection before accepting requests
    const connection = await pool.getConnection();
    console.log('✅ [Database] Connected to MySQL successfully.');
    connection.release();

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════╗');
      console.log('║     TELANGANA TODAY - Pipeline Server                ║');
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log(`║  🚀 Server running on port     : ${PORT}                 ║`);
      console.log(`║  🌐 Environment                : ${(process.env.NODE_ENV || 'development').padEnd(20)}║`);
      console.log(`║  🔗 API Base URL               : http://localhost:${PORT}/api ║`);
      console.log(`║  🔌 Socket.io                  : enabled              ║`);
      console.log(`║  📁 Uploads dir                : /uploads             ║`);
      console.log('╚══════════════════════════════════════════════════════╝');
      console.log('');
      console.log('  API Endpoints:');
      console.log(`    POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`    GET    http://localhost:${PORT}/api/stories`);
      console.log(`    GET    http://localhost:${PORT}/api/analytics/dashboard-stats`);
      console.log(`    GET    http://localhost:${PORT}/api/health`);
      console.log('');
    });
  } catch (err) {
    console.error('❌ [Database] Failed to connect to MySQL:', err.message);
    console.error('   Please check your .env DB_* configuration and ensure MySQL is running.');
    process.exit(1);
  }
};

// ---------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('[Database] Connection pool closed.');
    } catch (err) {
      console.error('[Database] Error closing pool:', err.message);
    }
    console.log('[Server] HTTP server closed. Goodbye.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UnhandledRejection]', reason);
  // Do not exit — log and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
