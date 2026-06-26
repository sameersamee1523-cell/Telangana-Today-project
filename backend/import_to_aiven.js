/**
 * ============================================================
 * Aiven MySQL Import Script
 * Imports schema.sql (and optionally seed.sql) into Aiven
 * ============================================================
 * Usage:
 *   node import_to_aiven.js --password=YOUR_AIVEN_PASSWORD
 *   node import_to_aiven.js --password=YOUR_AIVEN_PASSWORD --seed
 */

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// ── Parse CLI args ──────────────────────────────────────────
const args     = process.argv.slice(2);
const pwdArg   = args.find(a => a.startsWith('--password='));
const seedFlag = args.includes('--seed');

if (!pwdArg) {
  console.error('\n❌ ERROR: Please provide your Aiven password.');
  console.error('   Usage: node import_to_aiven.js --password=YOUR_AIVEN_PASSWORD\n');
  process.exit(1);
}

const AIVEN_PASSWORD = pwdArg.split('=').slice(1).join('=');

// ── Aiven Connection Config ─────────────────────────────────
const config = {
  host:              'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port:              4000,
  user:              'ne5QYoRPmmmiRKv.root',
  password:          AIVEN_PASSWORD,
  database:          'test',
  ssl:               { rejectUnauthorized: false },
  connectTimeout:    15000,
  multipleStatements: true,
};

// ── Helper: read and clean SQL file ────────────────────────
function readSQL(filePath) {
  let sql = fs.readFileSync(filePath, 'utf8');

  // Remove CREATE DATABASE and USE statements (not needed on Aiven)
  sql = sql.replace(/CREATE DATABASE[^;]+;/gi, '');
  sql = sql.replace(/USE\s+\w+\s*;/gi, '');

  return sql.trim();
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     Aiven MySQL Import Tool                  ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('🔌 Connecting to Aiven MySQL...');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   DB:   ${config.database}\n`);

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('\n   Check your password and try again.');
    process.exit(1);
  }

  // ── Import schema.sql ──────────────────────────────────
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  console.log('📋 Importing schema.sql...');
  try {
    const schemaSql = readSQL(schemaPath);
    await conn.query(schemaSql);
    console.log('✅ Schema imported successfully!\n');
  } catch (err) {
    console.error('❌ Schema import failed:', err.message);
    await conn.end();
    process.exit(1);
  }

  // ── Import seed.sql (optional) ─────────────────────────
  if (seedFlag) {
    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    console.log('🌱 Importing seed.sql...');
    try {
      const seedSql = readSQL(seedPath);
      await conn.query(seedSql);
      console.log('✅ Seed data imported successfully!\n');
    } catch (err) {
      console.error('❌ Seed import failed:', err.message);
      // Don't exit — schema is already done
    }
  }

  // ── Verify tables were created ─────────────────────────
  console.log('🔍 Verifying tables...');
  const [rows] = await conn.query('SHOW TABLES;');
  if (rows.length === 0) {
    console.log('⚠️  No tables found. Something may have gone wrong.');
  } else {
    console.log(`✅ Found ${rows.length} tables in defaultdb:\n`);
    rows.forEach(r => {
      const tableName = Object.values(r)[0];
      console.log(`   📦 ${tableName}`);
    });
  }

  await conn.end();
  console.log('\n🎉 Done! Your TiDB database is ready.');
  console.log('\n📝 Next step: Add these to Render Environment Variables:');
  console.log('   DB_HOST     = gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com');
  console.log('   DB_PORT     = 4000');
  console.log('   DB_USER     = ne5QYoRPmmmiRKv.root');
  console.log('   DB_PASSWORD = <your password>');
  console.log('   DB_NAME     = test');
  console.log('   DB_SSL      = true\n');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
