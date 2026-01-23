import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import locationRoutes from './routes/locations.js';
import typeRoutes from './routes/types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'housesadda',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.error('Error code:', err.code);
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database "housesadda" does not exist. Please create it first.');
      console.error('   Run: CREATE DATABASE housesadda;');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('💡 Cannot connect to MySQL. Make sure MySQL server is running.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Access denied. Check your database credentials in .env file.');
    }
    console.log('Please make sure MySQL is running and database is created');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/types', typeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

