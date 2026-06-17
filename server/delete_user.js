const mysql = require('mysql2/promise');
require('dotenv').config();

async function deleteUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [result] = await connection.execute(
      'DELETE FROM users WHERE email = ?',
      ['naseerbaba1523@gmail.com']
    );
    console.log(`Deleted ${result.affectedRows} user(s).`);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

deleteUser();
