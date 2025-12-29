const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");

/* Generate JWT Token */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username
    },
    secret,
    { expiresIn }
  );
};

/* LOGIN CONTROLLER */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const normalizedUsername = username.toLowerCase().trim();

    const user = await User.findOne({ username: normalizedUsername, isActive: true });
    if (!user) {
      console.log(`Login failed: User not found or inactive - ${normalizedUsername}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user - ${normalizedUsername}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* REGISTER CONTROLLER  */
exports.register = async (req, res) => {
  try {
    const { name, age, role, username, password, mobile, email, gender } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const user = await User.create({
      name,
      age,
      role,
      username,
      password,
      mobile,
      email,
      gender
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
