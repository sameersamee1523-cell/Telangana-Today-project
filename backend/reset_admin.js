const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const hash = await bcrypt.hash('Admin@123', 12);
    // Reset for all admin accounts
    const [result] = await connection.execute(
      `UPDATE users SET password_hash = ?, is_active = 1 WHERE role = 'admin'`,
      [hash]
    );
    console.log(`✅ Admin password reset for ${result.affectedRows} account(s).`);
    console.log('');
    console.log('--- LOGIN CREDENTIALS ---');
    console.log('Employee ID : ADM001');
    console.log('Email       : sameersamee1523@gmail.com');
    console.log('Password    : Admin@123');
    console.log('Role        : Admin');
    console.log('URL         : http://localhost:5173/login');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

resetAdminPassword();
