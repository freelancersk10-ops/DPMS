const filterUser = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
    age: user.age,
    gender: user.gender,
    mobile: user.mobile,
    email: user.email
  };
};
const filterPrescription = (prescription, userRole = "patient") => {
  if (!prescription) return null;

  const obj = {
    id: prescription._id,
    patient: prescription.patient,
    doctor: prescription.doctor,
    disease: prescription.disease,
    diseaseType: prescription.diseaseType,
    medications: prescription.medications || [],
    date: prescription.date,
    qrGenerated: prescription.qrGenerated
  };

  if (userRole === "patient" && obj.medications) {
    obj.medications = obj.medications.map(med => {
      const medObj = { ...med.toObject ? med.toObject() : med };
      medObj.amount = undefined;
      return medObj;
    });
  }

  return obj;
};

const filterQR = (qr, prescription, userRole = "patient") => {
  if (!qr) return null;

  const obj = {
    id: qr._id,
    prescription: qr.prescription,
    patient: qr.patient,
    doctor: qr.doctor,
    qrCode: qr.qrCode
  };

  const allAmountsEntered = prescription.medications && 
    prescription.medications.length > 0 &&
    prescription.medications.every(med => med.amount !== null && med.amount !== undefined);
  
  if (allAmountsEntered && userRole !== "admin") {
    obj.qrCode = undefined;
  }

  return obj;
};

module.exports = {
  filterUser,
  filterPrescription,
  filterQR
};
