const express = require("express");
const router = express.Router();

const prescriptionController = require("../controllers/prescriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  prescriptionController.createPrescription
);


router.get(
  "/doctor/:patientId",
  authMiddleware,
  roleMiddleware("doctor"),
  prescriptionController.getPrescriptionsByPatient
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  prescriptionController.getMyPrescriptions
);

router.get(
  "/my-doctor",
  authMiddleware,
  roleMiddleware("doctor"),
  prescriptionController.getMyDoctorPrescriptions
);


router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "doctor"),
  prescriptionController.getAllPrescriptions
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  prescriptionController.updatePrescription
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  prescriptionController.deletePrescription
);

module.exports = router;
