const Medication = require("../models/Medication");

/*CREATE MEDICATION */
exports.createMedication = async (req, res) => {
  try {
    const { medicineName, dosage, expireDate } = req.body;

    const existing = await Medication.findOne({ medicineName });
    if (existing) {
      return res.status(400).json({ message: "Medicine already exists" });
    }

    const medication = await Medication.create({
      medicineName,
      dosage,
      expireDate
    });

    res.status(201).json({
      message: "Medication created successfully",
      medication
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET ALL MEDICATIONS */
exports.getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ isActive: true }).sort({ medicineName: 1 });
    res.status(200).json(medications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET SINGLE MEDICATION */
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: "Medication not found" });

    res.status(200).json(medication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*    UPDATE MEDICATION */
exports.updateMedication = async (req, res) => {
  try {
    const { medicineName, dosage, expireDate } = req.body;

    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: "Medication not found" });

    medication.medicineName = medicineName || medication.medicineName;
    medication.dosage = dosage || medication.dosage;
    medication.expireDate = expireDate || medication.expireDate;

    await medication.save();

    res.status(200).json({
      message: "Medication updated successfully",
      medication
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE MEDICATION */
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: "Medication not found" });

    medication.isActive = false;
    await medication.save();

    res.status(200).json({ message: "Medication deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
