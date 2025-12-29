# Email Troubleshooting Guide

## Common Issues and Solutions

### 1. **No Email Received**

#### Check Backend Console
Look for these messages in your backend console:
- `✅ SMTP server connection verified` - Connection is working
- `✅ Medication reminder email sent successfully!` - Email was sent
- `❌ SMTP credentials not configured` - Need to set up .env file
- `❌ SMTP connection verification failed` - Check SMTP settings

#### Verify Configuration
1. Check if `.env` file exists in `backend/` directory
2. Verify these variables are set:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

#### Test Email Configuration
1. Go to Admin Dashboard
2. Scroll to "Email Configuration & Testing" section
3. Enter your email address
4. Click "Send Test Email"
5. Check the result message

### 2. **Gmail Authentication Failed**

**Problem:** `EAUTH` error or authentication failed

**Solution:**
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/
   - Security → 2-Step Verification
   - App passwords → Generate new app password
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this App Password (not your regular password) in `SMTP_PASS`

### 3. **Connection Timeout**

**Problem:** `ETIMEDOUT` or connection timeout

**Solutions:**
- Check your internet connection
- Verify SMTP_HOST is correct
- Try different SMTP_PORT (587 or 465)
- Check firewall settings

### 4. **Email Goes to Spam**

**Solutions:**
- Check spam/junk folder
- Mark email as "Not Spam"
- Add sender email to contacts
- For production, use a proper email service (SendGrid, Mailgun, etc.)

### 5. **Patient Email Not Found**

**Problem:** Email reminders not sent because patient has no email

**Solution:**
- Ensure patient user has an email address in the database
- Check user profile in Admin panel
- Update patient email if missing

## Testing Steps

1. **Check Email Config:**
   ```
   GET /api/reminders/check-config
   ```
   Should return `configured: true` and `connectionStatus: 'Connected'`

2. **Send Test Email:**
   ```
   POST /api/reminders/test-email
   Body: { "email": "your-email@example.com" }
   ```

3. **Check Backend Logs:**
   - Look for email sending logs
   - Check for any error messages
   - Verify patient email addresses

## Manual Testing

You can manually trigger a reminder for testing:
```
POST /api/reminders/send
Body: {
  "prescriptionId": "prescription_id_here",
  "timing": "M"  // or "A" or "N"
}
```

## Environment Variables Checklist

- [ ] `SMTP_HOST` is set
- [ ] `SMTP_PORT` is set (587 for TLS, 465 for SSL)
- [ ] `SMTP_USER` is set (your email)
- [ ] `SMTP_PASS` is set (app password for Gmail)
- [ ] `ENABLE_EMAIL_REMINDERS` is not set to 'false'

## Next Steps

If emails still don't work:
1. Check backend console for detailed error messages
2. Verify SMTP credentials are correct
3. Test with a different email provider
4. Check email provider's security settings
5. Consider using a dedicated email service for production

