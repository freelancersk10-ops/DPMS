const QR = require("../models/QR");
const Prescription = require("../models/Prescription");
const QRCode = require("qrcode");

/*  GENERATE QR */
exports.generateQR = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("patient", "name age gender mobile email")
      .populate("doctor", "name role")
      .populate("medications.medicine", "medicineName dosage");

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    const existingQR = await QR.findOne({ prescription: prescriptionId });
    if (existingQR) return res.status(400).json({ message: "QR already generated" });

    const qrData = {
      prescriptionId: prescription._id,
      patient: {
        id: prescription.patient._id,
        name: prescription.patient.name,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
        mobile: prescription.patient.mobile,
        email: prescription.patient.email
      },
      doctor: {
        id: prescription.doctor._id,
        name: prescription.doctor.name,
        role: prescription.doctor.role
      },
      medications: prescription.medications.map(med => ({
        medicine: {
          id: med.medicine._id,
          name: med.medicine.medicineName,
          dosage: med.medicine.dosage
        },
        timing: med.timing,
        amount: med.amount
      })),
      disease: prescription.disease,
      diseaseType: prescription.diseaseType,
      date: prescription.date,
      qrGenerated: prescription.qrGenerated,
      isActive: prescription.isActive
    };

    const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData));

    const qr = await QR.create({
      prescription: prescription._id,
      patient: prescription.patient._id,
      doctor: prescription.doctor._id,
      qrCode: qrCodeString
    });

    prescription.qrGenerated = true;
    await prescription.save();

    res.status(201).json({
      message: "QR generated successfully",
      qr
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET QR BY PRESCRIPTION */
exports.getQRByPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const qr = await QR.findOne({ prescription: prescriptionId })
      .populate("patient", "name")
      .populate("doctor", "name");

    if (!qr) return res.status(404).json({ message: "QR not found" });

    const prescription = await Prescription.findById(prescriptionId);
    let qrResponse = qr.toObject();

    const allAmountsEntered = prescription.medications && 
      prescription.medications.length > 0 &&
      prescription.medications.every(med => med.amount !== null && med.amount !== undefined);

    if (
      allAmountsEntered &&
      req.user.role !== "admin" 
    ) {
      qrResponse.qrCode = undefined;
    }

    res.status(200).json(qrResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET MY QRs (Patient's own QRs) */
exports.getMyQRs = async (req, res) => {
  try {
    const qrs = await QR.find({ 
      patient: req.user.id,
      isActive: true 
    })
      .populate("patient", "name age")
      .populate("doctor", "name")
      .populate({
        path: "prescription",
        populate: {
          path: "medications.medicine",
          select: "medicineName dosage"
        }
      })
      .sort({ createdAt: -1 });

    const processedQRs = [];
    for (const qr of qrs) {
      const qrObj = qr.toObject();
      
      if (qr.prescription) {
        const prescription = qr.prescription;
        const allAmountsEntered = prescription.medications && 
          prescription.medications.length > 0 &&
          prescription.medications.every(med => med.amount !== null && med.amount !== undefined);
        
        
        if (allAmountsEntered) {
          qrObj.qrCode = undefined;
        }
      }
      
      processedQRs.push(qrObj);
    }

    res.status(200).json(processedQRs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET ALL QRs */
exports.getAllQRs = async (req, res) => {
  try {
    const qrs = await QR.find({ isActive: true })
      .populate("patient", "name age")
      .populate("doctor", "name")
      .populate("prescription");

    res.status(200).json(qrs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
