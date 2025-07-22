const Message = require("../models/Messages");

exports.getMessagesByRoomId = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({
      timestamp: "asc",
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { roomId, sender } = req.body;
    
    if (!roomId || !sender) {
      return res.status(400).json({ error: "roomId and sender are required" });
    }

    // Determine message type based on file mime type
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    }

    // Cloudinary provides the secure_url directly
    const fileUrl = req.file.path; // This is the Cloudinary URL
    
    const newMessage = new Message({
      roomId,
      sender,
      content: req.file.originalname, // Store original filename as content
      messageType,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    await newMessage.save();
    
    res.status(201).json({
      message: "File uploaded successfully",
      data: newMessage
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
