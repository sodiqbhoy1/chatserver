const ChatRoom = require("../models/ChatRoom");

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
    await ChatRoom.deleteOne({ roomId: req.params.roomId });
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
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

