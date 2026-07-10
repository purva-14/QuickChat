const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");


const onlineUsers = new Map();

const initSocket = (io) => {

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });
    io.emit("presence:update", { userId, isOnline: true });

     socket.emit("presence:init", Array.from(onlineUsers.keys()));

    // ---- Direct messaging ----
    socket.on("message:send", async (payload) => {
      const { receiverId, message } = payload; 
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", message);
       
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        io.to(socket.id).emit("message:status", { messageId: message._id, status: "delivered" });
      }
    });

    // ---- Read receipts ----
    socket.on("message:seen", async ({ messageIds, senderId }) => {
      if (!messageIds?.length) return;
      await Message.updateMany({ _id: { $in: messageIds } }, { $set: { status: "seen" } });

      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message:status:bulk", { messageIds, status: "seen" });
      }
    });

    // ---- Typing indicators ----
    socket.on("typing:start", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("typing:stop", { userId });
    });

    // ---- Reactions broadcast ----
    socket.on("reaction:update", ({ receiverId, message }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("reaction:update", message);
    });

    // ---- Disconnect / presence ----
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date(), socketId: null });
      io.emit("presence:update", { userId, isOnline: false, lastSeen: new Date() });
    });
  });
};

module.exports = { initSocket, onlineUsers };
