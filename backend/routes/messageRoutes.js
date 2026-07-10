const express = require("express");
const {
  getConversation,
  sendMessage,
  reactToMessage,
  searchMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { uploadMessageImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/search", protect, searchMessages);
router.get("/:userId", protect, getConversation);
router.post("/:userId", protect, uploadMessageImage.single("image"), sendMessage);
router.put("/:messageId/react", protect, reactToMessage);

module.exports = router;
