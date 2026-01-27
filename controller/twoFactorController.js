import crypto from "crypto";
import sendEmail from "../lib/sendEmail.js";

/* Generate 6-digit OTP */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* SEND OTP */
export const send2FAOtp = async (req, res) => {
  try {
    const user = req.user; // ✅ from auth middleware

    const otp = generateOTP();
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // store dynamically (no schema change)
    user.twoFactorOTP = hashedOtp;
    user.twoFactorOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendEmail(
      user.email,
      "Your 2FA OTP",
      `<h2>${otp}</h2><p>Valid for 10 minutes</p>`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* VERIFY OTP */
export const verify2FAOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (
      user.twoFactorOTP !== hashedOtp ||
      user.twoFactorOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpiry = undefined;
    user.twoFactorEnabled = true; // optional flag
    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
