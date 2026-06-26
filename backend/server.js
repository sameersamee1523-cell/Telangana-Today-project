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

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');

// ---------------------------------------------------------------
// Core modules — crash immediately if any of these fail
// ---------------------------------------------------------------
console.log('[Startup] Loading core modules...');
const pool         = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./sockets/handlers');
console.log('[Startup] Core modules loaded OK');

// ---------------------------------------------------------------
// Route imports — wrapped individually so a single bad file
// does NOT silently kill all routes; error is visible in logs
// ---------------------------------------------------------------
console.log('[Startup] Loading route modules...');

let authRoutes, userRoutes, storyRoutes, notificationRoutes,
    analyticsRoutes, reportRoutes, adminRoutes;

try { authRoutes = require('./routes/auth'); console.log('[Startup] ✅ auth routes loaded'); }
catch (e) { console.error('[Startup] ❌ auth routes FAILED:', e.message); process.exit(1); }

try { userRoutes = require('./routes/users'); console.log('[Startup] ✅ users routes loaded'); }
catch (e) { console.error('[Startup] ❌ users routes FAILED:', e.message); process.exit(1); }

try { storyRoutes = require('./routes/stories'); console.log('[Startup] ✅ stories routes loaded'); }
catch (e) { console.error('[Startup] ❌ stories routes FAILED:', e.message); process.exit(1); }

try { notificationRoutes = require('./routes/notifications'); console.log('[Startup] ✅ notifications routes loaded'); }
catch (e) { console.error('[Startup] ❌ notifications routes FAILED:', e.message); process.exit(1); }

try { analyticsRoutes = require('./routes/analytics'); console.log('[Startup] ✅ analytics routes loaded'); }
catch (e) { console.error('[Startup] ❌ analytics routes FAILED:', e.message); process.exit(1); }

try { reportRoutes = require('./routes/reports'); console.log('[Startup] ✅ reports routes loaded'); }
catch (e) { console.error('[Startup] ❌ reports routes FAILED:', e.message); process.exit(1); }

try { adminRoutes = require('./routes/admin'); console.log('[Startup] ✅ admin routes loaded'); }
catch (e) { console.error('[Startup] ❌ admin routes FAILED:', e.message); process.exit(1); }

console.log('[Startup] All route modules loaded successfully');

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
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://telangana-today.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, Postman, curl)
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
app.options('*', cors(corsOptions));

// ---------------------------------------------------------------
// Request Logging
// ---------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ---------------------------------------------------------------
// Body Parsers — MUST be before routes
// ---------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------
// Static File Serving - Uploads folder
// ---------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------
// Root Route — confirms server identity & version
// ---------------------------------------------------------------
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'Telangana Today - Pipeline Server',
    version: '1.0.0',
    status:  'running',
    timestamp: new Date().toISOString()
  });
});

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
// Start Server — listen FIRST, then verify DB connection
// This ensures routes are always reachable even if DB is slow
// ---------------------------------------------------------------
const PORT = parseInt(process.env.PORT, 10) || 5000;

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

  // Verify DB connection after server is already accepting requests
  pool.getConnection()
    .then(connection => {
      console.log('✅ [Database] Connected to MySQL successfully.');
      connection.release();
    })
    .catch(err => {
      console.error('⚠️  [Database] Could not connect to MySQL at startup:', err.message);
      console.error('   The server will continue running. DB-dependent routes will fail until DB is available.');
    });
});

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
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
  // Do not exit — log and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  process.exit(1);
});

module.exports = { app, server, io };
