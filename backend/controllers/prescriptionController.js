const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Medication = require("../models/Medication");

/* CREATE PRESCRIPTION */
exports.createPrescription = async (req, res) => {
  try {
    const { patient, disease, diseaseType, medications, date } = req.body;

    const patientExists = await User.findById(patient);
    if (!patientExists) return res.status(404).json({ message: "Patient not found" });

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: "At least one medication is required" });
    }

    for (const med of medications) {
      if (!med.medicine) {
        return res.status(400).json({ message: "Medicine ID is required for all medications" });
      }
      if (!med.timing || !Array.isArray(med.timing) || med.timing.length === 0) {
        return res.status(400).json({ message: "Timing is required for all medications" });
      }
      
      const medicineExists = await Medication.findById(med.medicine);
      if (!medicineExists) {
        return res.status(404).json({ message: `Medicine with ID ${med.medicine} not found` });
      }
    }

    const prescription = await Prescription.create({
      patient,
      doctor: req.user.id,
      disease,
      diseaseType,
      medications,
      date: date || new Date()
    });

    await prescription.populate('patient', 'name age gender');
    await prescription.populate('doctor', 'name');
    await prescription.populate('medications.medicine', 'medicineName dosage');

    res.status(201).json({
      message: "Prescription created successfully",
      prescription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* GET PRESCRIPTIONS BY PATIENT */
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({
      doctor: req.user.id,
      patient: patientId,
      isActive: true
    })
      .populate("medications.medicine", "medicineName dosage")
      .populate("patient", "name age gender")
      .populate("doctor", "name")
      .sort({ date: -1 });

    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET PRESCRIPTIONS FOR PATIENT */
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user.id,
      isActive: true
    })
      .populate("medications.medicine", "medicineName dosage")
      .populate("doctor", "name")
      .sort({ date: -1 });

    const filtered = prescriptions.map((p) => {
      const obj = p.toObject();
      if (obj.medications) {
        obj.medications = obj.medications.map(med => {
          const medObj = { ...med };
          medObj.amount = undefined;
          return medObj;
        });
      }
      return obj;
    });

    res.status(200).json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET MY DOCTOR PRESCRIPTIONS */
exports.getMyDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      doctor: req.user.id,
      isActive: true
    })
      .populate("patient", "name age gender")
      .populate("medications.medicine", "medicineName dosage")
      .sort({ date: -1 });

    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*  GET ALL PRESCRIPTIONS */
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ isActive: true })
      .populate("doctor", "name role")
      .populate("patient", "name age gender")
      .populate("medications.medicine", "medicineName dosage")
      .sort({ date: -1 });

    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE PRESCRIPTION */
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    Object.keys(updateFields).forEach((field) => {
      prescription[field] = updateFields[field];
    });

    await prescription.save();

    res.status(200).json({
      message: "Prescription updated successfully",
      prescription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE PRESCRIPTION (Soft Delete) */
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    prescription.isActive = false;
    await prescription.save();

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
