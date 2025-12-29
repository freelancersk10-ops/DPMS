const express = require("express");
const router = express.Router();

const pharmacistController = require("../controllers/pharmacistController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("pharmacist"),
  pharmacistController.getPendingPrescriptions
);


router.put(
  "/enter-amount",
  authMiddleware,
  roleMiddleware("pharmacist"),
  pharmacistController.enterAmount
);

module.exports = router;
