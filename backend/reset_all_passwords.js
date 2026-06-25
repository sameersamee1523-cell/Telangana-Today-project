const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAllPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const accounts = [
    { id: 7,  role: 'admin',        password: 'Admin@123'    },
    { id: 1,  role: 'admin',        password: 'Admin@123'    },
    { id: 2,  role: 'chief_editor', password: 'Chief@123'    },
    { id: 10, role: 'chief_editor', password: 'Chief@123'    },
    { id: 3,  role: 'editor',       password: 'Editor@123'   },
    { id: 4,  role: 'reporter',     password: 'Reporter@123' },
    { id: 5,  role: 'reporter',     password: 'Reporter@123' },
    { id: 9,  role: 'reporter',     password: 'Reporter@123' },
  ];

  try {
    for (const acc of accounts) {
      const hash = await bcrypt.hash(acc.password, 12);
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?',
        [hash, acc.id]
      );
    }

    // Fetch all users with their employee_ids
    const [users] = await connection.execute(
      `SELECT u.id, u.employee_id, u.name, u.email, u.role, u.is_active, d.name AS department
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.role, u.id`
    );

    console.log('\n✅ All passwords reset successfully!\n');
    console.log('='.repeat(80));
    console.log('TELANGANA TODAY — ALL LOGIN CREDENTIALS');
    console.log('='.repeat(80));

    const passwordMap = {
      admin:        'Admin@123',
      chief_editor: 'Chief@123',
      editor:       'Editor@123',
      reporter:     'Reporter@123',
      photographer: 'Photo@123',
    };

    for (const u of users) {
      const pwd = passwordMap[u.role];
      console.log(`\nRole      : ${u.role.replace('_', ' ').toUpperCase()}`);
      console.log(`Name      : ${u.name}`);
      console.log(`Emp ID    : ${u.employee_id || 'N/A'}`);
      console.log(`Email     : ${u.email}`);
      console.log(`Password  : ${pwd}`);
      console.log(`Active    : ${u.is_active ? 'Yes' : 'No'}`);
      console.log('-'.repeat(50));
    }

    console.log('\n🌐 Login URL: http://localhost:5173/login');
    console.log('   Use Employee ID or Email with the password above.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

resetAllPasswords();
