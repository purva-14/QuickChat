const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: "Username or email already in use" });
    }

    const user = await User.create({ fullName, username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername?.toLowerCase() }, { username: emailOrUsername?.toLowerCase() }],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
const me = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
};

// @route POST /api/auth/logout
const logout = async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, me, logout };
