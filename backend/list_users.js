const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function listUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
  });

  try {
    const [rows] = await connection.execute('SELECT id, employee_id, name, email, role, is_active FROM users');
    console.log('--- USERS IN DATABASE ---');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error fetching users:', err.message);
  } finally {
    await connection.end();
  }
}

listUsers();
