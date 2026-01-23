import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  let connection;
  
  try {
    console.log('Testing database connection...');
    console.log('Config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'housesadda',
      password: process.env.DB_PASSWORD ? '***' : '(empty)'
    });

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'housesadda',
    });

    console.log('✅ Successfully connected to MySQL!');

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful');

    // Check if admin_users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'admin_users'"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  Table "admin_users" does not exist');
      console.log('   Run: mysql -u root -p housesadda < database/schema.sql');
    } else {
      console.log('✅ Table "admin_users" exists');
      
      // Check if admin user exists
      const [users] = await connection.execute(
        'SELECT * FROM admin_users WHERE username = ?',
        ['admin']
      );
      
      if (users.length === 0) {
        console.log('⚠️  Admin user does not exist');
        console.log('   Run: npm run setup:admin');
      } else {
        console.log('✅ Admin user exists');
      }
    }

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database "housesadda" does not exist.');
      console.error('   Create it with: CREATE DATABASE housesadda;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Cannot connect to MySQL server.');
      console.error('   Make sure MySQL is running:');
      console.error('   - Windows: Check Services or XAMPP/WAMP');
      console.error('   - Mac/Linux: sudo systemctl start mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your .env file:');
      console.error('   DB_USER=' + (process.env.DB_USER || 'root'));
      console.error('   DB_PASSWORD=' + (process.env.DB_PASSWORD ? '***' : '(empty)'));
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();

