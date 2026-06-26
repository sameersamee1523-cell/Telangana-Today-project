const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
  });

  try {
    // Check if user already exists
    const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', ['sameersamee1523@gmail.com']);
    
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    
    if (existing.length > 0) {
      // Update existing admin
      await connection.execute(
        `UPDATE users 
         SET password_hash = ?, is_active = 1, role = 'admin' 
         WHERE email = ?`,
        [passwordHash, 'sameersamee1523@gmail.com']
      );
      console.log('✅ Admin user "sameersamee1523@gmail.com" password updated/reset successfully.');
    } else {
      // Create new admin
      await connection.execute(
        `INSERT INTO users (employee_id, name, email, password_hash, role, department_id, phone, bio, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['ADM001', 'System Admin', 'sameersamee1523@gmail.com', passwordHash, 'admin', null, '+91-0000000000', 'System Administrator', 1]
      );
      console.log('✅ Admin user "sameersamee1523@gmail.com" created successfully.');
    }
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    await connection.end();
  }
}

createAdmin();
