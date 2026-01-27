const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../lib/jwt");

// ================== SIGNUP ==================
exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      phone,
      type,
      password,
      state,
      city,
      fullAddress,
    } = req.body;

    // 🔴 REQUIRED FIELD CHECK
    if (
      !name ||
      !email ||
      !username ||
      !phone ||
      !type ||
      !password ||
      !state ||
      !city ||
      !fullAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔴 DUPLICATE CHECK (email / username / phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email, username, or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      username,
      phone,
      type,
      password: hashedPassword,
      authProvider: "local",
      address: {
        state,
        city,
        fullAddress,
      },
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({
      id: user._id,
      type: user.type,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        type: user.type,
        address: user.address,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== VERIFY PASSWORD ==================
exports.verifyPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password verified" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};
