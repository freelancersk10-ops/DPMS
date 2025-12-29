const app = require("./app");
const dotenv = require("dotenv");
const { scheduleMedicationReminders } = require("./utils/medicationReminderScheduler");

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  
  console.log('\n Email Configuration Status:');
  if (smtpUser && smtpPass) {
    console.log(`   SMTP configured`);
    console.log(`   Host: ${smtpHost}`);
    console.log(`   User: ${smtpUser.substring(0, 3)}***`);
    console.log(`   Password: ${smtpPass ? '***' : 'Not set'}`);
  } else {
    console.log(`   SMTP not configured`);
    console.log(`   Please set SMTP_USER and SMTP_PASS in .env file`);
    console.log(`   Email reminders will not work until configured`);
  }
  
  // Initialize medication reminder scheduler
  if (process.env.ENABLE_EMAIL_REMINDERS !== 'false') {
    if (smtpUser && smtpPass) {
      // Test email connection on startup
      const { testConnection } = require('./utils/emailService');
      console.log('   Testing SMTP connection...');
      testConnection().then(result => {
        if (result.success) {
          scheduleMedicationReminders();
          console.log('   Medication reminder scheduler started');
        } else {
          console.log(`   ⚠️  SMTP connection test failed: ${result.error}`);
          console.log('   Email reminders will not work until SMTP is properly configured');
          console.log('   Please check your SMTP credentials in .env file');
        }
      }).catch(err => {
        console.log(`   ⚠️  Error testing SMTP: ${err.message}`);
      });
    } else {
      console.log('   Medication reminder scheduler not started (SMTP not configured)');
    }
  } else {
    console.log('   Email reminders are disabled (ENABLE_EMAIL_REMINDERS=false)');
  }
  console.log('');
});
