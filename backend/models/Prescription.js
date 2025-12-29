const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    disease: {
      type: String,
      required: true
    },

    diseaseType: {
      type: String,
      enum: ["General", "Long Time", "Chronic"],
      default: "General"
    },

    medications: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medication",
          required: true
        },
        timing: [
          {
            type: String,
            enum: ["M", "A", "N"],
            required: true
          }
        ],
        amount: {
          type: Number,
          default: null
        }
      }
    ],

    date: {
      type: Date,
      default: Date.now
    },

    qrGenerated: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
