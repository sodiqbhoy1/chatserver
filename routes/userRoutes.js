const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.userRegister);
router.get("/users", userController.fetchAllUsers);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;