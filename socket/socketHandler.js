const Message = require("../models/Messages");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ roomId, username }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user_joined", `${username} joined`);
    });

    socket.on("send_message", async (data) => {
      console.log("Received message from frontend:", data);
      try {
        const messageData = {
          roomId: data.roomId,
          sender: data.sender,
          content: data.content,
          messageType: data.messageType || 'text',
        };

        // Add file-related fields if it's a file message
        if (data.messageType && data.messageType !== 'text') {
          messageData.fileUrl = data.fileUrl;
          messageData.fileName = data.fileName;
          messageData.fileSize = data.fileSize;
        }

        const newMessage = new Message(messageData);
        const savedMessage = await newMessage.save();
        console.log("Message saved to DB:", savedMessage);

        const broadcastData = savedMessage.toObject();

        console.log(
          "Broadcasting 'receive_message' to room:",
          broadcastData.roomId,
          "with data:",
          broadcastData
        );
        io.to(broadcastData.roomId).emit("receive_message", broadcastData);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};


