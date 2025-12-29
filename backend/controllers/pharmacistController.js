const Prescription = require("../models/Prescription");

/* GET PRESCRIPTIONS WITH QR */
exports.getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      qrGenerated: true,
      isActive: true
    })
      .populate("patient", "name age gender")
      .populate("doctor", "name")
      .populate("medications.medicine", "medicineName dosage")
      .sort({ date: -1 });

    const filtered = prescriptions.filter(p => 
      p.medications && 
      p.medications.length > 0 &&
      p.medications.some(med => med.amount === null || med.amount === undefined)
    );

    res.status(200).json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.enterAmount = async (req, res) => {
  try {
    const { prescriptionId, medications } = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    if (medications && Array.isArray(medications)) {

      medications.forEach((medUpdate) => {
        const med = prescription.medications.id(medUpdate._id || medUpdate.medicine);
        if (med && medUpdate.amount !== undefined) {
          med.amount = medUpdate.amount;
        }
      });
    } else {
      const { amount } = req.body;
      if (amount !== undefined && prescription.medications.length > 0) {
        const amountPerMed = amount / prescription.medications.length;
        prescription.medications.forEach(med => {
          if (!med.amount) {
            med.amount = amountPerMed;
          }
        });
      }
    }

    await prescription.save();

    await prescription.populate('patient', 'name age gender');
    await prescription.populate('doctor', 'name');
    await prescription.populate('medications.medicine', 'medicineName dosage');

    res.status(200).json({
      message: "Amount entered successfully",
      prescription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
