const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

// Signup Route
router.post("/signup", userController.signup);

// Login Route
router.post("/login", userController.login);

// Get User Profile Route
router.get("/profile", userController.getProfile);

// Logout Route
router.post("/logout", userController.logout);

// Edit User Profile Route
router.put("/profile", userController.editProfile);

//Edit PassWord
router.put("/editPass", userController.editPassword);

//Verify New Account
router.post("/verify", userController.verifyCode);

//Send verify to reset
router.post("/forget-password", userController.sendForgotPasswordCode);

//Reset password
router.post("/reset-password", userController.resetPassword);

module.exports = router;
