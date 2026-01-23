# Vercel Deployment Guide

## ✅ Static SPA Deployment (Zero Serverless Functions)

This project is configured as a **fully static Single Page Application** for Vercel's free plan.

### Configuration

- **Framework**: None (static files)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Serverless Functions**: 0 (all removed)

### Environment Variables (Vercel Dashboard)

Set these in **Vercel Project Settings → Environment Variables**:

```
VITE_SUPABASE_URL=https://ycsvgcvrknipvvrbjond.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: 
- Only `VITE_` prefixed variables are needed (frontend-only)
- No backend environment variables required
- No `SUPABASE_SERVICE_ROLE_KEY` needed

### Build Process

1. Vite builds static files to `dist/` folder
2. Vercel serves static files
3. All routes rewrite to `/index.html` (SPA routing)
4. No serverless functions are created

### Verification

After deployment, check:
- ✅ Vercel dashboard shows **0 serverless functions**
- ✅ Build logs show static file output
- ✅ All routes work (SPA routing)
- ✅ Admin panel works (Supabase direct)
- ✅ File uploads work (Supabase Storage)

### Troubleshooting

#### "Function limit exceeded" error
- Verify `.vercelignore` includes `api/` and `server/`
- Check `vercel.json` doesn't reference API routes
- Ensure no files export request handlers

#### Build fails
- Check Node.js version (Vercel auto-detects)
- Verify `package.json` has correct build script
- Check for TypeScript errors

#### Routes not working
- Verify `vercel.json` has SPA rewrite rule
- Check `index.html` exists in `dist/`
- Ensure React Router is configured correctly

### Files Structure

```
/
├── dist/              # Build output (generated)
├── src/               # Source code
├── public/            # Static assets
├── vercel.json        # Vercel configuration
├── vite.config.ts     # Vite configuration
└── .vercelignore      # Ignored files
```

### Deployment Steps

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy (automatic on push)

No additional configuration needed!

