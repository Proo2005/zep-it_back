const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile } = require("../controller/userController");

// GET CURRENT LOGGED-IN USER (/me)
router.get("/me", auth, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// GET PROFILE
router.get("/profile", auth, getProfile);

module.exports = router;
