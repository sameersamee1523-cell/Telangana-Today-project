/**
 * TiDB Cloud Database Setup Script
 * Creates pipeline_db and applies the full schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
      port: 4000,
      user: 'ox4YpiyrWbH1THa.root',
      password: 'iu3NMBIP2jGfcIDs',
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
      multipleStatements: false
    });

    console.log('Connected to TiDB Cloud');

    const schemaPath = path.join('C:', 'pipeline', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons, clean up, filter empty
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('Found ' + statements.length + ' SQL statements to execute...');

    for (const stmt of statements) {
      try {
        await conn.execute(stmt);
        if (stmt.toUpperCase().includes('CREATE DATABASE')) {
          console.log('Created database: pipeline_db');
        } else if (stmt.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (tableMatch) console.log('Created table: ' + tableMatch[1]);
        }
      } catch (e) {
        if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DB_CREATE_EXISTS') {
          console.log('Already exists, skipping...');
        } else {
          console.warn('Warning: ' + e.message.substring(0, 120));
        }
      }
    }

    console.log('\nTiDB Cloud database setup complete!');
    console.log('Host: gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com');
    console.log('Database: pipeline_db');
    await conn.end();
  } catch (e) {
    console.error('Setup failed: ' + e.message);
    if (conn) await conn.end();
    process.exit(1);
  }
}

setup();
