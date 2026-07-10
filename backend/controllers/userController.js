const User = require("../models/User");

// @route GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/search?q=
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ users: [] });

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const user = req.user;

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @route GET /api/users/:userId/status
const getUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("isOnline lastSeen");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, searchUsers, updateProfile,getUserStatus };
