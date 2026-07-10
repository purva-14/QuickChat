require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

connectDB();

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
  "https://quick-chat-swart.vercel.app",
  "http://localhost:5173"
];


const corsOptionsDelegate = (origin, callback) => {
  
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.includes(origin) || origin === process.env.CLIENT_URL) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};


const io = new Server(server, {
  cors: {
    origin: corsOptionsDelegate,
    credentials: true,
  },
});


app.use(cors({ 
  origin: corsOptionsDelegate, 
  credentials: true 
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => res.json({ status: "QuickChat API is running" }));


app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message || "Something went wrong" });
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`QuickChat server running on port ${PORT}`));