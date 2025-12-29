import React, { useState } from "react";
import axios from "axios";

const GenerateQR = ({ token }) => {
  const [prescriptionId, setPrescriptionId] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    if (!prescriptionId) {
      setMessage("Please enter prescription ID");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/qr/generate`,
        { prescriptionId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setQrImage(res.data.qr.qrCode);
      setMessage("QR Generated Successfully!");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to generate QR");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Generate QR for Prescription</h2>
      <input
        type="text"
        placeholder="Enter Prescription ID"
        value={prescriptionId}
        onChange={(e) => setPrescriptionId(e.target.value)}
        style={{ padding: "0.5rem", width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleGenerate} style={{ padding: "0.5rem 1rem" }}>
        Generate QR
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      {qrImage && (
        <div style={{ marginTop: "1rem" }}>
          <img src={qrImage} alt="QR Code" />
        </div>
      )}
    </div>
  );
};

export default GenerateQR;
