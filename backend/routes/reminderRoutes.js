const express = require("express");
const router = express.Router();

const reminderController = require("../controllers/reminderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/patient",
  authMiddleware,
  roleMiddleware("patient"),
  reminderController.getPatientReminders
);

router.post(
  "/send",
  authMiddleware,
  roleMiddleware("admin", "doctor"),
  reminderController.sendManualReminder
);

router.post(
  "/test-email",
  authMiddleware,
  roleMiddleware("admin"),
  reminderController.testEmail
);

router.get(
  "/check-config",
  authMiddleware,
  roleMiddleware("admin"),
  reminderController.checkEmailConfig
);

module.exports = router;

