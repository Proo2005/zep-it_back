import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../lib/sendEmail.js";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
export const send2FAOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.set("twoFactorOTP", hashedOtp);
    user.set("twoFactorOTPExpiry", Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendEmail(
      user.email,
      "Your 2FA OTP",
      `<h2>Your OTP is: ${otp}</h2><p>Valid for 10 minutes.</p>`
    );

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
export const verify2FAOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (
      user.twoFactorOTP !== hashedOtp ||
      user.twoFactorOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP correct → enable 2FA
    user.set("twoFactorOTP", undefined);
    user.set("twoFactorOTPExpiry", undefined);
    user.set("twoFactorEnabled", true);
    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
