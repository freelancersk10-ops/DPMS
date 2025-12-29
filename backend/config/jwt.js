module.exports = {
  secret: process.env.JWT_SECRET || "digital_prescription_secret_key",
  expiresIn: "1d"
};
