const express = require("express");
const router = express.Router();
const { signup, login,verifyPassword } = require("../controller/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-password", verifyPassword);

module.exports = router;
