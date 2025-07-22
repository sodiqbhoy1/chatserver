const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController")

router.post("/admin/signup", adminController.signup);
router.post("/admin/login", adminController.signin);
router.post("/admin/forgot-password", adminController.forgotPassword);
router.post("/admin/reset-password/:token", adminController.resetPassword);
router.get("/admin/details", adminController.getProfile);

module.exports = router;