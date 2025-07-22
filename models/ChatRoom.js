const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
