const express = require("express");
const router = express.Router();

const qrController = require("../controllers/qrController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("doctor"),
  qrController.generateQR
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("patient"),
  qrController.getMyQRs
);

router.get(
  "/:prescriptionId",
  authMiddleware,
  roleMiddleware("doctor", "patient", "pharmacist", "admin"),
  qrController.getQRByPrescription
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  qrController.getAllQRs
);

module.exports = router;
