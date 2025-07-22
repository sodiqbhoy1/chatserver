const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const socketHandler = require("./socket/socketHandler");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://client-nine-sage.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();

// Proper CORS for Express routes
app.use(cors({
  origin: "https://client-nine-sage.vercel.app",
  credentials: true
}));

app.options("*", cors({
  origin: "https://client-nine-sage.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use('/', adminRoutes);
app.use("/", chatRoutes);

// Socket setup
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
