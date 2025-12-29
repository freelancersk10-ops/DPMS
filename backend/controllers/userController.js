const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* GET ALL USERS*/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;

    const users = await User.find({ role }).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};


/*GET SINGLE USER */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*CREATE USER */
exports.createUser = async (req, res) => {
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

/*  UPDATE USER */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, role, username, password, mobile, email, gender } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.age = age || user.age;
    user.role = role || user.role;
    user.username = username || user.username;
    user.mobile = mobile || user.mobile;
    user.email = email || user.email;
    user.gender = gender || user.gender;

    if (password) {
      user.password = password; 
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
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

/* DELETE USER (Soft Delete) */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
