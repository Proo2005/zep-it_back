const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile } = require("../controller/userController");
const User = require("../models/User");

// GET CURRENT LOGGED-IN USER (/me)
router.get("/me", auth, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});


//delete profile
router.delete("/delete", auth, async (req, res) => {
  try {
    const userId = req.user.id; // set in auth middleware from token
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete account" });
  }
});


// GET PROFILE
router.get("/profile", auth, getProfile);

module.exports = router;
