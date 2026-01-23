import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupAdmin() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'housesadda',
    });

    console.log('✅ Connected to MySQL database');

    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      ['admin']
    );

    // Generate password hash
    const password = 'admin123';
    const hashedPassword = bcrypt.hashSync(password, 10);

    if (users.length === 0) {
      // Create admin user
      await connection.execute(
        'INSERT INTO admin_users (username, password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✅ Admin user created successfully');
    } else {
      // Update admin password
      await connection.execute(
        'UPDATE admin_users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✅ Admin user password updated successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist. Please create it first:');
      console.error('   CREATE DATABASE housesadda;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Cannot connect to MySQL. Please make sure MySQL is running.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Please check your database credentials in .env file.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupAdmin();

