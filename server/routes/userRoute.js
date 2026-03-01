const express = require("express");
const {
  handleRegister,
  handleLoginUser,
} = require("../controllers/userController");

const router = express.Router();

// Register
router.post("/register", handleRegister);

// Login
router.post("/login", handleLoginUser);

module.exports = router;
