const cron = require('node-cron');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { sendMedicationReminder } = require('./emailService');

const scheduleMedicationReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running morning medication reminder check...');
    await sendRemindersForTiming('M');
  });

  cron.schedule('0 14 * * *', async () => {
    console.log('Running afternoon medication reminder check...');
    await sendRemindersForTiming('A');
  });

  cron.schedule('0 20 * * *', async () => {
    console.log('Running night medication reminder check...');
    await sendRemindersForTiming('N');
  });

  console.log('Medication reminder scheduler initialized');
};


const sendRemindersForTiming = async (timing) => {
  try {
    console.log(`\n=== Processing ${timing} medication reminders ===`);

    const prescriptions = await Prescription.find({
      isActive: true,
      qrGenerated: true,
      'medications.timing': timing
    })
      .populate({
        path: 'patient',
        select: 'name email',
        model: 'User'
      })
      .populate('medications.medicine', 'medicineName dosage');

    console.log(`Found ${prescriptions.length} prescriptions with ${timing} timing`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const prescription of prescriptions) {
      const prescriptionDate = new Date(prescription.date);
      const daysSincePrescription = Math.floor((new Date() - prescriptionDate) / (1000 * 60 * 60 * 24));

      if (daysSincePrescription > 90) {
        console.log(`Skipping prescription ${prescription._id} - older than 90 days`);
        continue;
      }

      const medicationsForTiming = prescription.medications.filter(med => 
        med.timing && med.timing.includes(timing)
      );

      if (medicationsForTiming.length === 0) {
        continue;
      }

      if (!prescription.patient) {
        console.log(`Skipping prescription ${prescription._id} - patient not found`);
        emailsSkipped++;
        continue;
      }

      const patientEmail = prescription.patient.email;
      const patientName = prescription.patient.name || 'Patient';

      if (!patientEmail) {
        console.log(` Skipping prescription ${prescription._id} - No email for patient: ${patientName}`);
        emailsSkipped++;
        continue;
      }

      console.log(`Sending reminder to ${patientName} (${patientEmail})`);
      
      const result = await sendMedicationReminder(
        patientEmail,
        patientName,
        medicationsForTiming,
        [timing]
      );

      if (result.success) {
        console.log(`Email sent successfully to ${patientEmail}`);
        emailsSent++;
      } else {
        console.log(`Failed to send email to ${patientEmail}:`, result.error || result.message);
        emailsSkipped++;
      }
    }

    console.log(`\n=== Summary for ${timing} timing ===`);
    console.log(`Emails sent: ${emailsSent}`);
    console.log(`Emails skipped: ${emailsSkipped}`);
    console.log(`=====================================\n`);
  } catch (error) {
    console.error(`Error sending reminders for timing ${timing}:`, error);
  }
};

module.exports = {
  scheduleMedicationReminders
};

