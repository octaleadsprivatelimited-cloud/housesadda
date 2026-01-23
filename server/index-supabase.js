import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './db-supabase.js';

// Import routes
import authRoutes from './routes/auth-supabase.js';
import propertyRoutes from './routes/properties-supabase.js';
import locationRoutes from './routes/locations-supabase.js';
import typeRoutes from './routes/types-supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
let dbInitialized = false;

async function startServer() {
  try {
    await initDatabase();
    dbInitialized = true;
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/properties', propertyRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/types', typeRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Server is running', 
        database: 'Supabase',
        url: process.env.SUPABASE_URL ? 'configured' : 'not configured'
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Using Supabase database`);
      console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL || 'Not configured'}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await closeDatabase();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

