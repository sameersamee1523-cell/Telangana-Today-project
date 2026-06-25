const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const passwordHash = await bcrypt.hash('Cheif@123', 12);
    const [result] = await connection.execute(
      `INSERT INTO users (employee_id, name, email, password_hash, role, department_id, phone, bio, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['EMP001', 'Naseer Baba', 'naseerbaba1523@gmail.com', passwordHash, 'chief_editor', 1, '+91-0000000000', 'Chief Editor', 1]
    );
    console.log(`Added ${result.affectedRows} user(s). ID: ${result.insertId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

addUser();
