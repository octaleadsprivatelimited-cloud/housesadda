# Supabase Setup Guide for HousesAdda

This guide will help you set up Supabase as your database for the HousesAdda project.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Basic knowledge of SQL

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: HousesAdda (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project" and wait for it to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two keys:
   - **Project URL**: Found under "Project URL" (e.g., `https://xxxxx.supabase.co`)
   - **Service Role Key**: Found under "Project API keys" → "service_role" key (⚠️ Keep this secret!)
   - **Anon Key**: Found under "Project API keys" → "anon" key (for client-side use)

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `database/schema-supabase.sql` from this project
4. Paste it into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 4: Configure Environment Variables

Update your `.env` file in the project root with your Supabase credentials:

```env
# Database Configuration
DB_TYPE=supabase

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
PORT=3001

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

**Important Notes:**
- Replace `your-project-id`, `your-service-role-key-here`, and `your-anon-key-here` with your actual values
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - never commit this to version control!
- The `SUPABASE_ANON_KEY` is safe for client-side use (if needed in the future)

## Step 5: Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

The Supabase client library (`@supabase/supabase-js`) should already be installed.

## Step 6: Start the Application

Start both the frontend and backend with Supabase:

```bash
npm run dev:all:supabase
```

Or start them separately:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend with Supabase):**
```bash
npm run dev:server:supabase
```

## Step 7: Verify Setup

1. Open your browser and go to `http://localhost:8080`
2. Check the backend logs - you should see:
   - `✅ Connected to Supabase`
   - `✅ Table admin_users exists`
   - `✅ Table properties exists`
   - etc.

3. Test the admin login:
   - Go to `http://localhost:8080/admin`
   - Username: `admin`
   - Password: `admin123`

## Default Data

The schema includes default data:
- **Admin User**: `admin` / `admin123` (⚠️ Change this in production!)
- **Property Types**: Apartment, Villa, Plot, Commercial, PG
- **Locations**: Various Hyderabad locations

## Troubleshooting

### Error: "Supabase credentials are missing"
- Make sure your `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check that there are no extra spaces or quotes around the values

### Error: "Table does not exist"
- Make sure you ran the SQL schema in the Supabase SQL Editor
- Check the Supabase dashboard → Table Editor to verify tables exist

### Error: "Invalid API key"
- Double-check your `SUPABASE_SERVICE_ROLE_KEY` in the `.env` file
- Make sure you're using the **service_role** key, not the anon key

### Connection Issues
- Verify your Supabase project is active (not paused)
- Check your internet connection
- Ensure the Supabase URL is correct

## Database Management

### Viewing Data in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor** in the sidebar
3. Select any table to view and edit data

### Running Custom Queries

1. Go to **SQL Editor** in the Supabase dashboard
2. Write your SQL queries
3. Click "Run" to execute

### Backing Up Data

Supabase automatically backs up your database. You can also:
1. Go to **Settings** → **Database**
2. Use the backup/restore features
3. Export data using the SQL Editor

## Switching Between Databases

You can easily switch between database backends:

- **SQLite**: `npm run dev:server` (default)
- **MySQL**: `npm run dev:server:mysql`
- **Supabase**: `npm run dev:server:supabase`

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use Service Role Key only on server-side** - Never expose it in client code
3. **Change default admin password** - Update it immediately after first login
4. **Enable Row Level Security (RLS)** - Uncomment RLS policies in the schema if needed
5. **Use environment-specific keys** - Different keys for development and production

## Production Deployment

For production:

1. Create a new Supabase project for production
2. Run the schema migration
3. Update production environment variables
4. Use strong `JWT_SECRET`
5. Enable RLS policies for additional security
6. Set up proper CORS settings in Supabase

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase SQL Reference](https://supabase.com/docs/guides/database)

## Support

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Review the server console output
3. Verify all environment variables are set correctly
4. Ensure the database schema was run successfully

