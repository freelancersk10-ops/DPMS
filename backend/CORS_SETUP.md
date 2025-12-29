# CORS Configuration Guide

## Current Setup

The backend CORS configuration allows requests from:

1. **Development URLs:**

   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - Value from `FRONTEND_URL` environment variable

2. **Production URLs:**
   - `https://dpms1.netlify.app` (hardcoded)
   - Any Netlify preview URL matching pattern: `https://*.netlify.app`

## Environment Variables

### Required

```env
FRONTEND_URL=http://localhost:5173
```

### Optional

```env
# Add additional frontend URLs (comma-separated)
ADDITIONAL_FRONTEND_URLS=https://your-custom-domain.com,https://another-domain.com
```

## Adding New Frontend Domains

### Option 1: Environment Variable (Recommended)

Add to your `.env` file:

```env
ADDITIONAL_FRONTEND_URLS=https://your-new-domain.com,https://another-domain.com
```

### Option 2: Hardcode in app.js

Add to the `allowedOrigins` array in `backend/app.js`:

```javascript
const allowedOrigins = [
  // ... existing origins
  "https://your-new-domain.com",
];
```

## Testing CORS

If you're getting CORS errors:

1. **Check the origin** - Look at the browser console error message
2. **Verify backend logs** - The backend logs blocked origins: `CORS blocked origin: <origin>`
3. **Check environment variables** - Make sure `FRONTEND_URL` is set correctly
4. **Restart backend** - After changing `.env`, restart the backend server

## Common Issues

### Issue: "No 'Access-Control-Allow-Origin' header"

**Solution:**

- Check that your frontend URL is in the `allowedOrigins` list
- Verify the backend server has been restarted after changes
- Check backend console for CORS error logs

### Issue: Preflight request fails

**Solution:**

- The CORS config includes `OPTIONS` method and proper headers
- Make sure `credentials: true` is set (already configured)

### Issue: Works locally but not on Netlify

**Solution:**

- Make sure `https://dpms1.netlify.app` is in allowed origins (already added)
- Check that backend is deployed and running
- Verify backend URL is correct in frontend config
