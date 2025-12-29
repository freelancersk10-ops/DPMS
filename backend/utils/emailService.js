const nodemailer = require('nodemailer');

// Cache transporter to avoid recreating it
let cachedTransporter = null;

const createTransporter = () => {
  // Return cached transporter if already created and valid
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const useSecure = smtpPort === 465;

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
  }

  // Create transporter with proper Gmail configuration
  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: useSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      // Do not fail on invalid certificates (useful for development)
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    // Connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  return cachedTransporter;
};

const sendMedicationReminder = async (patientEmail, patientName, medications, timing) => {
  try {
    if (!patientEmail) {
      console.log(`❌ No email address for patient: ${patientName}`);
      return { success: false, message: 'No email address found' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      console.log(`❌ Invalid email format for patient: ${patientName} - ${patientEmail}`);
      return { success: false, message: 'Invalid email format' };
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!smtpUser || !smtpPass) {
      console.log(`❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file`);
      return { success: false, message: 'Email service not configured. Please contact administrator.' };
    }

    console.log(`📧 Preparing to send email to: ${patientEmail} (${patientName})`);
    
    // Create transporter (will throw error if not configured)
    let transporter;
    try {
      transporter = createTransporter();
    } catch (transporterError) {
      console.error('❌ Failed to create email transporter:', transporterError.message);
      return { 
        success: false, 
        error: transporterError.message,
        details: 'Please configure SMTP settings in .env file'
      };
    }
    
    const medicationsList = medications.map(med => 
      `• ${med.medicine?.medicineName || med.name || 'Medicine'} (${med.medicine?.dosage || med.dosage || 'N/A'})`
    ).join('\n');

    const timingMap = {
      'M': 'Morning (8:00 AM)',
      'A': 'Afternoon (2:00 PM)',
      'N': 'Night (8:00 PM)'
    };
    const timingText = timing.map(t => timingMap[t] || t).join(', ');

    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"Digital Prescription System" <${fromEmail}>`,
      to: patientEmail,
      replyTo: fromEmail,
      subject: '💊 Medication Reminder - Time to Take Your Medicine',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .medication-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .timing-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; margin: 5px 5px 5px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💊 Medication Reminder</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${patientName}</strong>,</p>
              
              <p>This is a friendly reminder that it's time to take your medication!</p>
              
              <div class="medication-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Medications:</h3>
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${medicationsList}</pre>
              </div>
              
              <p><strong>⏰ Timing:</strong> <span class="timing-badge">${timingText}</span></p>
              
              <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Important:</strong> Please take your medications as prescribed by your doctor. 
                If you have any questions or concerns, please contact your healthcare provider.
              </p>
              
              <p>Stay healthy! 💚</p>
              
              <div class="footer">
                <p>This is an automated reminder from Digital Prescription Management System</p>
                <p>Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Medication Reminder
        
        Hello ${patientName},
        
        This is a friendly reminder that it's time to take your medication!
        
        Your Medications:
        ${medicationsList}
        
        Timing: ${timingText}
        
        Important: Please take your medications as prescribed by your doctor.
        
        Stay healthy!
        
        ---
        Digital Prescription Management System
      `
    };

    // Log email sending attempt
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || 587;
    console.log(`   Attempting to send email via ${smtpHost}:${smtpPort}`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${patientEmail}`);
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Medication reminder email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${patientEmail}`);
    console.log(`   From: ${mailOptions.from}`);
    return { success: true, messageId: info.messageId, to: patientEmail };
  } catch (error) {
    console.error('❌ Error sending medication reminder email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    // Reset cached transporter on error so it can be recreated
    cachedTransporter = null;
    
    // Provide more specific error messages
    let errorMessage = error.message;
    let details = 'Check backend console for more details';
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'Authentication failed. Please check your email and password in .env file.';
      details = 'For Gmail: Make sure you are using an App Password, not your regular password. Enable 2-Step Verification and generate an App Password.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      errorMessage = 'Connection failed. Please check your SMTP_HOST and SMTP_PORT settings.';
      details = `Unable to connect to ${process.env.SMTP_HOST || 'smtp.gmail.com'}. Check your internet connection.`;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      errorMessage = 'Connection timeout. Please check your internet connection and SMTP settings.';
      details = 'The SMTP server did not respond in time. Check firewall settings and network connection.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email address.';
      details = `The recipient email address "${patientEmail}" appears to be invalid.`;
    } else if (error.response) {
      errorMessage = `SMTP server error: ${error.response}`;
      details = 'The email server returned an error. Check your SMTP credentials.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code || error.responseCode,
      details: details,
      fullError: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

/**
 * Test email connection
 * Call this to verify SMTP configuration
 */
const testConnection = async () => {
  try {
    // Check if credentials exist first
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!smtpUser || !smtpPass) {
      return { 
        success: false, 
        error: 'SMTP credentials not configured',
        message: 'Please set SMTP_USER and SMTP_PASS in .env file'
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return { success: true, message: 'SMTP connection verified' };
  } catch (error) {
    console.error('❌ SMTP connection test failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Full error:', error);
    cachedTransporter = null; // Reset on error
    
    let errorMessage = error.message;
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'Authentication failed. Please check your email and password. For Gmail, use an App Password.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      errorMessage = `Connection failed. Cannot connect to ${process.env.SMTP_HOST || 'smtp.gmail.com'}`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout. Check your internet connection and firewall settings.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      message: errorMessage,
      code: error.code || error.responseCode
    };
  }
};

module.exports = {
  sendMedicationReminder,
  createTransporter,
  testConnection
};

