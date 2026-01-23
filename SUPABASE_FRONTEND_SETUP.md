# Supabase Frontend-Only Setup Guide

This guide explains how to set up Supabase for frontend-only admin panel with file uploads.

## Prerequisites

1. Supabase project created
2. Database schema run (from `database/schema-supabase.sql`)
3. Environment variables configured

## Step 1: Environment Variables

Add these to your `.env` file (for local development) and Vercel (for production):

```env
# Supabase Frontend Configuration
VITE_SUPABASE_URL=https://ycsvgcvrknipvvrbjond.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc3ZnY3Zya25pcHZ2cmJqb25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjA2NzQsImV4cCI6MjA4Mzc5NjY3NH0.g7qoi_wvhskcy64POMUJyq6tNYRbavtUMwIC7cBXWQE
```

**Important:** 
- Use `VITE_` prefix for frontend variables
- Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Only use `VITE_SUPABASE_ANON_KEY` (publishable key) in frontend

## Step 2: Create Supabase Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Create bucket:
   - **Name:** `admin-uploads`
   - **Public:** ✅ Yes (for public image access)
   - **File size limit:** 5MB (or your preference)
   - **Allowed MIME types:** `image/*` (or specific: `image/jpeg,image/png,image/webp`)

4. Click **Create bucket**

## Step 3: Set Up Storage Policies (RLS)

Go to **Storage** → `admin-uploads` → **Policies**

### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-uploads');
```

### Policy 2: Allow Authenticated Uploads
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-uploads' 
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Allow Authenticated Updates
```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'admin-uploads' 
  AND auth.role() = 'authenticated'
);
```

### Policy 4: Allow Authenticated Deletes
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-uploads' 
  AND auth.role() = 'authenticated'
);
```

**Note:** Since we're using `admin_users` table (not Supabase Auth), you may need to adjust policies. For now, you can make the bucket public for uploads, or use a service role key in a serverless function for uploads.

## Step 4: Alternative - Use Service Role for Uploads (More Secure)

If RLS is too restrictive, you can create a serverless function for file uploads:

Create `api/upload.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle file upload
  // ... implementation
}
```

## Step 5: Verify Setup

1. **Check environment variables are set:**
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```

2. **Test file upload:**
   - Go to admin panel
   - Try uploading an image
   - Check Supabase Storage → `admin-uploads` bucket
   - Image should appear there

3. **Test data persistence:**
   - Create/edit a property
   - Refresh page
   - Data should persist

## Troubleshooting

### "Bucket not found" error
- Make sure bucket `admin-uploads` exists in Supabase Storage
- Check bucket name matches exactly

### "Permission denied" on upload
- Check Storage policies are set correctly
- For public uploads, make bucket public
- Or use service role key in serverless function

### Images not displaying
- Check image URLs are public
- Verify bucket is set to public
- Check CORS settings in Supabase

### "Invalid API key" error
- Verify `VITE_SUPABASE_ANON_KEY` is set correctly
- Make sure you're using the **anon** key, not service role key
- Check key hasn't expired

## Security Notes

1. **Never expose service role key** in frontend code
2. **Use RLS policies** to restrict access
3. **Validate file types** on upload
4. **Set file size limits** in bucket settings
5. **Use authenticated uploads** when possible

## File Upload Flow

1. User selects file in admin form
2. File is uploaded to Supabase Storage (`admin-uploads` bucket)
3. Public URL is returned
4. URL is stored in `property_images` table
5. Images are displayed using public URLs

## Current Implementation

The admin panel now:
- ✅ Uses Supabase directly from frontend
- ✅ Uploads files to Supabase Storage
- ✅ Stores all data in Supabase database
- ✅ Works without backend API routes
- ✅ Persists data after refresh

