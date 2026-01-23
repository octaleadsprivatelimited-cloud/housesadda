# Vercel Static Deployment Fix

## Problem
Vercel was detecting `/api` folder and creating serverless functions, exceeding the Hobby plan limit of 12 functions.

## Solution
Converted the app to a **fully static SPA** with zero serverless functions.

## Changes Made

### 1. Removed `/api` Folder
- Deleted all serverless functions (auth, properties, locations, types, upload)
- These were causing Vercel to create serverless functions

### 2. Updated Authentication
- Created `src/lib/supabase-auth.ts` for frontend-only auth
- Uses Supabase database functions (runs on Supabase, not Vercel)
- Updated `AdminLogin.tsx` and `AdminSettings.tsx` to use new auth
- Created `database/supabase-auth-function.sql` for password verification

### 3. Updated File Uploads
- Modified `src/lib/supabase.ts` to upload directly to Supabase Storage
- No API route needed - uploads go directly from frontend to Supabase
- Requires `admin-uploads` bucket to be public or have proper RLS policies

### 4. Updated Vercel Configuration
- Modified `vercel.json`:
  - Removed API route rewrites
  - Added SPA rewrite: all routes → `/index.html`
  - Set `outputDirectory: "dist"` for static output
  - Set `framework: null` to ensure static deployment

### 5. Updated Vite Configuration
- Added build configuration:
  - `ssr: false` - ensures no server-side rendering
  - Code splitting for better performance
  - Static output to `dist/` folder

### 6. Created `.vercelignore`
- Ensures `/api` folder (if recreated) is ignored by Vercel

## Setup Required

### 1. Supabase Database Function
Run `database/supabase-auth-function.sql` in Supabase SQL Editor:
```sql
-- This creates a function for password verification
-- Runs on Supabase, not Vercel (doesn't count as serverless function)
```

### 2. Supabase Storage Bucket
- Create bucket: `admin-uploads`
- Set as **Public** (or configure RLS policies)
- This allows direct uploads from frontend

### 3. Environment Variables (Vercel)
Set these in Vercel Dashboard:
```
VITE_SUPABASE_URL=https://ycsvgcvrknipvvrbjond.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** No backend environment variables needed (SUPABASE_SERVICE_ROLE_KEY, etc.)

## Verification

After deployment, verify:
1. ✅ Vercel shows **0 serverless functions**
2. ✅ Build output is static files in `dist/`
3. ✅ Admin login works (uses Supabase database function)
4. ✅ File uploads work (direct to Supabase Storage)
5. ✅ All CRUD operations work (direct Supabase queries)

## Architecture

```
Frontend (React SPA)
  ↓
Supabase Client (anon key)
  ↓
Supabase Database (PostgreSQL)
  ↓
Supabase Storage (admin-uploads bucket)
```

**No Vercel serverless functions** - everything runs on Supabase or client-side.

## Benefits

1. ✅ **Zero serverless functions** - works on Hobby plan
2. ✅ **Faster deployments** - static files only
3. ✅ **Lower costs** - no function execution time
4. ✅ **Simpler architecture** - frontend-only
5. ✅ **Better performance** - static assets are cached

## Troubleshooting

### "Function limit exceeded" error
- Check `.vercelignore` includes `api/`
- Verify `vercel.json` doesn't reference `/api` routes
- Ensure no files in root export request handlers

### Authentication fails
- Verify Supabase database function is created
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check browser console for errors

### File uploads fail
- Verify `admin-uploads` bucket exists
- Check bucket is public or has proper RLS policies
- Check browser console for CORS errors

## Files Modified

- ✅ `vercel.json` - Static SPA configuration
- ✅ `vite.config.ts` - Static build output
- ✅ `src/lib/supabase.ts` - Direct file uploads
- ✅ `src/lib/supabase-auth.ts` - Frontend-only auth (new)
- ✅ `src/pages/admin/AdminLogin.tsx` - Uses Supabase auth
- ✅ `src/pages/admin/AdminSettings.tsx` - Uses Supabase auth
- ✅ `.vercelignore` - Ignore API folder (new)
- ✅ `database/supabase-auth-function.sql` - Auth function (new)

## Files Removed

- ❌ `/api` folder (all serverless functions)
- ❌ All API route handlers

## Next Steps

1. Deploy to Vercel
2. Verify 0 serverless functions in Vercel dashboard
3. Test admin login
4. Test file uploads
5. Verify all CRUD operations work

