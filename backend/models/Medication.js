const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    dosage: {
      type: String,
      required: true
    },

    expireDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
