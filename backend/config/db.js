/**
 * Database Connection Pool
 * MySQL2 promise-based connection pool for Telangana Today Pipeline Server
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance under load
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pipeline_db',
  ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30' // IST timezone for Telangana Today
});

module.exports = pool;
