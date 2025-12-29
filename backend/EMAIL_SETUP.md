# Email Reminder Setup Guide

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Or use these alternative variable names
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Enable/Disable email reminders (set to 'false' to disable)
ENABLE_EMAIL_REMINDERS=true
```

## Gmail Setup

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS` or `EMAIL_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Installation

After adding the environment variables, install the required packages:

```bash
cd backend
npm install nodemailer node-cron
```

## Testing

The email reminders are automatically scheduled:
- Morning: 8:00 AM
- Afternoon: 2:00 PM  
- Night: 8:00 PM

To test manually, you can use the API endpoint (Admin/Doctor only):
```
POST /api/reminders/send
{
  "prescriptionId": "prescription_id",
  "timing": "M" // or "A" or "N"
}
```

