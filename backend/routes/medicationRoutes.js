const express = require("express");
const router = express.Router();

const medicationController = require("../controllers/medicationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/* CREATE MEDICATION */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  medicationController.createMedication
);

router.get("/", authMiddleware, medicationController.getAllMedications);

router.get("/:id", authMiddleware, medicationController.getMedicationById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  medicationController.updateMedication
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  medicationController.deleteMedication
);

module.exports = router;
