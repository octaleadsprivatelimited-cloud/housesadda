# Fixing Blank White Page on Vercel

## Common Causes

1. **Missing Environment Variables** - Supabase client fails to initialize
2. **JavaScript Errors** - Uncaught errors prevent React from mounting
3. **Cache Issues** - Aggressive caching headers
4. **Routing Issues** - SPA routes not configured correctly

## Fixes Applied

### 1. Updated `vercel.json`
- Removed aggressive Cache-Control from HTML files
- Kept caching only for assets
- Ensured proper SPA rewrites

### 2. Updated `vite.config.ts`
- Added explicit `base: "/"` for correct asset paths
- Ensured static output configuration

### 3. Updated `src/lib/supabase.ts`
- Added error handling for missing environment variables
- App continues to work even if Supabase vars are missing
- Prevents app crash on initialization

### 4. Added Error Boundary
- Created `ErrorBoundary.tsx` component
- Wraps entire app to catch and display errors gracefully
- Prevents blank page on uncaught errors

### 5. Added `public/_redirects`
- Fallback for SPA routing
- Ensures all routes serve index.html

## Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://ycsvgcvrknipvvrbjond.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: 
- Must be set for **Production** environment
- Can also set for **Preview** and **Development**
- Variables must start with `VITE_` to be available in frontend

## Debugging Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Look for red error messages

2. **Check Network Tab**
   - Verify `index.html` loads (200 status)
   - Check if JavaScript files load
   - Look for 404 errors

3. **Check Vercel Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Build Logs for errors

4. **Verify Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure variables are set for correct environment
   - Redeploy after adding variables

## Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] Build completes successfully
- [ ] No JavaScript errors in console
- [ ] `index.html` loads correctly
- [ ] Assets (JS/CSS) load correctly
- [ ] Error boundary catches any errors

## If Still Blank

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or use Incognito/Private mode

2. **Check Vercel Deployment**
   - Verify deployment succeeded
   - Check if it's using correct branch
   - Try redeploying

3. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```
   - If local preview works, issue is with Vercel config
   - If local preview fails, issue is with code

4. **Check Browser Compatibility**
   - Try different browser
   - Check if JavaScript is enabled
   - Check for browser extensions blocking scripts

## Expected Behavior

After fixes:
- ✅ Page loads with content
- ✅ No console errors (or only warnings)
- ✅ React app mounts successfully
- ✅ Routes work correctly
- ✅ Supabase features work (if env vars set)

