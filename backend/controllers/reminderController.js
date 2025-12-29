const Prescription = require("../models/Prescription");
const { sendMedicationReminder } = require("../utils/emailService");

/* SEND MANUAL REMINDER */
exports.sendManualReminder = async (req, res) => {
  try {
    const { prescriptionId, timing } = req.body;

    const prescription = await Prescription.findById(prescriptionId)
      .populate({
        path: 'patient',
        select: 'name email',
        model: 'User'
      })
      .populate('medications.medicine', 'medicineName dosage');

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (!prescription.patient?.email) {
      return res.status(400).json({ message: "Patient email not found" });
    }

    const medicationsForTiming = prescription.medications.filter(med => 
      med.timing && med.timing.includes(timing)
    );

    if (medicationsForTiming.length === 0) {
      return res.status(400).json({ message: `No medications scheduled for timing: ${timing}` });
    }

    const result = await sendMedicationReminder(
      prescription.patient.email,
      prescription.patient.name,
      medicationsForTiming,
      [timing]
    );

    if (result.success) {
      res.status(200).json({
        message: "Reminder email sent successfully",
        result
      });
    } else {
      res.status(500).json({
        message: "Failed to send reminder email",
        error: result.error || result.message
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET PATIENT REMINDERS */
exports.getPatientReminders = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user.id,
      isActive: true,
      qrGenerated: true
    })
      .populate('medications.medicine', 'medicineName dosage')
      .sort({ date: -1 });

    const reminders = {
      morning: [],
      afternoon: [],
      night: []
    };

    prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        const medicationInfo = {
          prescriptionId: prescription._id,
          disease: prescription.disease,
          medicineName: med.medicine?.medicineName || 'N/A',
          dosage: med.medicine?.dosage || 'N/A',
          date: prescription.date
        };

        if (med.timing?.includes('M')) {
          reminders.morning.push(medicationInfo);
        }
        if (med.timing?.includes('A')) {
          reminders.afternoon.push(medicationInfo);
        }
        if (med.timing?.includes('N')) {
          reminders.night.push(medicationInfo);
        }
      });
    });

    res.status(200).json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* TEST EMAIL SENDING */
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ 
        message: "Email service not configured",
        details: "Please set SMTP_USER and SMTP_PASS in .env file"
      });
    }

    console.log(`\n Testing email to: ${email}`);
    console.log(`   SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   SMTP User: ${smtpUser}`);

    const { sendMedicationReminder } = require("../utils/emailService");

    const result = await sendMedicationReminder(
      email,
      'Test Patient',
      [{ medicine: { medicineName: 'Test Medicine', dosage: '500mg' } }],
      ['M']
    );

    if (result.success) {
      res.status(200).json({
        message: "Test email sent successfully! Please check your inbox (and spam folder).",
        result: {
          messageId: result.messageId,
          to: result.to
        }
      });
    } else {
      res.status(500).json({
        message: "Failed to send test email",
        error: result.error || result.message,
        details: result.details || 'Check backend console for more information',
        code: result.code
      });
    }
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

/* CHECK EMAIL CONFIGURATION */
exports.checkEmailConfig = async (req, res) => {
  try {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || 587;

    // Debug logging
    console.log('Checking email config:', {
      hasUser: !!smtpUser,
      hasPass: !!smtpPass,
      host: smtpHost,
      port: smtpPort,
      userPreview: smtpUser ? `${smtpUser.substring(0, 5)}...` : 'none'
    });

    const config = {
      configured: !!(smtpUser && smtpPass),
      smtpHost,
      smtpPort: parseInt(smtpPort, 10),
      smtpUser: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'Not set',
      hasPassword: !!smtpPass,
      connectionStatus: 'Not tested'
    };

    // Only test connection if credentials are configured
    if (config.configured) {
      try {
        const { testConnection } = require("../utils/emailService");
        const testResult = await testConnection();
        
        if (testResult.success) {
          config.connectionStatus = 'Connected';
        } else {
          config.connectionStatus = 'Failed';
          config.connectionError = testResult.error || testResult.message;
          config.connectionCode = testResult.code;
        }
      } catch (error) {
        console.error('Error testing email connection:', error);
        config.connectionStatus = 'Failed';
        config.connectionError = error.message || 'Unknown error';
        config.connectionCode = error.code;
      }
    } else {
      config.connectionStatus = 'Not configured';
    }

    res.status(200).json(config);
  } catch (err) {
    console.error('Error in checkEmailConfig:', err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message,
      configured: false
    });
  }
};

