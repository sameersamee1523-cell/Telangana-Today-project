const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const hash = await bcrypt.hash('Reporter@123', 12);
    const [result] = await connection.execute(
      `INSERT INTO users (employee_id, name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
      ['REP004', 'Syeda Moona', 'syedmymoona4@gmail.com', hash, 'reporter']
    );
    console.log('✅ User added/updated successfully!');
    console.log('');
    console.log('--- LOGIN CREDENTIALS ---');
    console.log('Email    : syedmymoona4@gmail.com');
    console.log('Password : Reporter@123');
    console.log('Role     : Reporter');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

addUser();
