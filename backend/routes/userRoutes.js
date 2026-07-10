const express = require("express");
const { getUsers, searchUsers, updateProfile,getUserStatus } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, uploadAvatar.single("avatar"), updateProfile);
router.get("/:userId/status", protect, getUserStatus);

module.exports = router;
