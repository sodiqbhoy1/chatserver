const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Messages"); // Import the Message model

exports.createRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const newRoom = new ChatRoom({ roomId });
    await newRoom.save();

    res.status(201).json({ message: "Room created", roomId });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Error creating room" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // First, delete all messages associated with the room
    await Message.deleteMany({ roomId });

    // Then, delete the room itself
    await ChatRoom.deleteOne({ roomId });

    res.status(200).json({ message: "Room and all associated messages deleted" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ error: "Error deleting room" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

