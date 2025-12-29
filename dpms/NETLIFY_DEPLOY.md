# Netlify Deployment Guide

## Configuration Files

### 1. `netlify.toml`
- Configures build settings and redirects
- All routes redirect to `/index.html` for SPA routing

### 2. `public/_redirects`
- Fallback redirect file for Netlify
- Ensures all routes work with React Router

### 3. Environment Variables

In Netlify Dashboard, go to **Site settings → Environment variables** and add:

```
VITE_API_BASE_URL=https://dpms-3.onrender.com/api
```

Or if you want to use the default (already configured in api.js):
- Leave it empty (it will use `https://dpms-3.onrender.com/api` in production)

## Build Settings in Netlify

1. **Base directory**: `dpms`
2. **Build command**: `npm run build`
3. **Publish directory**: `dpms/dist`

## Deployment Steps

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Base directory: `dpms`
   - Build command: `npm run build`
   - Publish directory: `dpms/dist`
3. Add environment variable (optional):
   - `VITE_API_BASE_URL=https://dpms-3.onrender.com/api`
4. Deploy!

## Troubleshooting

### 404 Errors on Routes
- ✅ `netlify.toml` is configured with redirects
- ✅ `public/_redirects` file exists
- Make sure both files are in the `dpms` directory

### API 404 Errors
- Check that `VITE_API_BASE_URL` is set correctly
- Verify backend is running at `https://dpms-3.onrender.com`
- Check browser console for actual API calls being made

### Build Fails
- Make sure base directory is set to `dpms`
- Check that `package.json` has a `build` script
- Verify all dependencies are in `package.json`

