const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const messageController = require("../controllers/messageController");
const upload = require("../config/upload");


router.post("/create", chatController.createRoom);
router.delete("/:roomId", chatController.deleteRoom);
router.get("/all", chatController.getAllRooms);
router.get("/messages/:roomId", messageController.getMessagesByRoomId);
router.post("/upload", upload.single('file'), messageController.uploadFile);

module.exports = router;
