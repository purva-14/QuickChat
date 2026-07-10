const Message = require("../models/Message");

// @route GET /api/messages/:userId  (conversation between me and userId)
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("replyTo", "text image sender")
      .populate("reactions.user", "username");

    // Mark incoming messages as seen
    await Message.updateMany(
      { sender: userId, receiver: myId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/messages/:userId  (send message, text and/or image)
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text, replyTo } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({ message: "Message must have text or an image" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      text: text || "",
      image: req.file ? `/uploads/messages/${req.file.filename}` : "",
      replyTo: replyTo || null,
    });

    const populated = await message.populate("replyTo", "text image sender");
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/messages/:messageId/react
const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1); // toggle off
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();
    res.status(200).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/messages/search?q=
const searchMessages = async (req, res) => {
  try {
    const { q, userId } = req.query;
    const myId = req.user._id;

    const filter = {
      text: { $regex: q, $options: "i" },
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    };

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversation, sendMessage, reactToMessage, searchMessages };
