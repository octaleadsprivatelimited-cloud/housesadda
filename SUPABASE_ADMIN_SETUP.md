# Fix Admin Login After Vercel Deployment

## Problem
Admin credentials work on localhost but not after deployment to Vercel.

## Root Cause
The admin user doesn't exist in your Supabase database. The schema needs to be run in Supabase, or the admin user needs to be created manually.

## Solution Options

### Option 1: Run Supabase Schema (Recommended)

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the sidebar
   - Click **New query**

3. **Run the Admin User Creation SQL**
   ```sql
   -- Create admin user if it doesn't exist
   INSERT INTO admin_users (username, password) VALUES 
   ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
   ON CONFLICT (username) DO NOTHING;
   ```

4. **Or Run Full Schema**
   - Copy the entire contents of `database/schema-supabase.sql`
   - Paste into SQL Editor
   - Click **Run**

### Option 2: Use Setup API Endpoint

1. **Call the setup endpoint** (one-time):
   ```bash
   curl -X POST https://your-domain.vercel.app/api/setup/admin \
     -H "Content-Type: application/json"
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Admin user created successfully",
     "credentials": {
       "username": "admin",
       "password": "admin123"
     }
   }
   ```

3. **After setup, DELETE the `/api/setup/admin.js` file** for security.

### Option 3: Create Admin User Manually in Supabase

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open Table Editor**
   - Click **Table Editor** in the sidebar
   - Select `admin_users` table

3. **Insert New Row**
   - Click **Insert** → **Insert row**
   - Enter:
     - `username`: `admin`
     - `password`: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
   - Click **Save**

## Verify Admin User Exists

**Check in Supabase:**
1. Go to **Table Editor** → `admin_users`
2. You should see a row with username `admin`

**Or query:**
```sql
SELECT id, username, created_at FROM admin_users WHERE username = 'admin';
```

## Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the password after first login!

## Troubleshooting

### Still can't login?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → **Functions** tab
   - Look for login attempts and error messages

2. **Verify Environment Variables:**
   - Make sure `SUPABASE_URL` is correct
   - Make sure `SUPABASE_SERVICE_ROLE_KEY` is set
   - Verify you're using the correct Supabase project

3. **Check Supabase Connection:**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```
   Should return: `"url": "configured"`

4. **Test Direct Query:**
   - Go to Supabase SQL Editor
   - Run: `SELECT * FROM admin_users WHERE username = 'admin';`
   - Should return 1 row

5. **Check Password Hash:**
   - The password hash must match exactly
   - Current hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
   - This is for password: `admin123`

## After Fixing

Once the admin user exists:
1. Try logging in again
2. If successful, change the password immediately
3. Delete `/api/setup/admin.js` for security

