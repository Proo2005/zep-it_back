import User from "../models/User.js";

// GET LOGGED-IN USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    if (!userId) return res.status(401).json({ success: false, message: "Not logged in" });

    const user = await User.findById(userId).select("name email address type");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
