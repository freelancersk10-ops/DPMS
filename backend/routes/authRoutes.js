const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/* LOGIN */
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
