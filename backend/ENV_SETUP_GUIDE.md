# Environment Variables Setup Guide

## Current Configuration

Your `.env` file should be located in the `backend/` directory.

## Required Variables

### Database
```env
MONGO_URI=your_mongodb_connection_string
```

### JWT Authentication
```env
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

### Server
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Email Configuration (CRITICAL for email reminders)

#### Gmail Setup (Current Configuration)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
```

**Important for Gmail:**
1. You CANNOT use your regular Gmail password
2. You MUST use an App Password
3. Steps to get App Password:
   - Go to https://myaccount.google.com/
   - Click "Security" in the left sidebar
   - Enable "2-Step Verification" if not already enabled
   - Scroll down to "App passwords"
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other" and type "Node.js"
   - Click "Generate"
   - Copy the 16-character password (no spaces)
   - Use this password in `SMTP_PASS`

#### Alternative Email Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Troubleshooting Email Issues

### Issue: "Authentication failed" or "EAUTH" error
**Solution:** 
- For Gmail: Use App Password, not regular password
- Check if 2-Step Verification is enabled
- Verify the password has no extra spaces

### Issue: "Connection timeout" or "ECONNECTION" error
**Solution:**
- Check your internet connection
- Verify SMTP_HOST is correct
- Check firewall settings
- Try port 465 with secure: true

### Issue: Emails not received
**Solution:**
- Check spam/junk folder
- Verify recipient email is correct
- Check backend console for error messages
- Test with Admin Dashboard email test tool

## Testing Your Configuration

1. **Check Server Startup:**
   When you start the server, you should see:
   ```
   Email Configuration Status:
      SMTP configured
      Host: smtp.gmail.com
      User: you***
      Password: ***
      Medication reminder scheduler started
   ```

2. **Use Admin Dashboard:**
   - Log in as Admin
   - Go to Dashboard
   - Scroll to "Email Configuration & Testing"
   - Enter your email
   - Click "Send Test Email"
   - Check the result

3. **Check Backend Console:**
   Look for these messages:
   - `✅ SMTP server connection verified` - Good!
   - `✅ Medication reminder email sent successfully!` - Email sent!
   - `❌ Authentication failed` - Check password
   - `❌ Connection failed` - Check SMTP settings

## Security Notes

- Never commit `.env` file to Git
- Keep your App Passwords secure
- Rotate passwords regularly
- Use environment-specific configurations

