const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  content: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file'], 
    default: 'text' 
  },
  fileUrl: { type: String }, // URL to the uploaded file
  fileName: { type: String }, // Original file name
  fileSize: { type: Number }, // File size in bytes
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Messages", messageSchema);
