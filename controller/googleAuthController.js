const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // 🔹 auto-generate username
      const baseUsername = email.split("@")[0];
      let username = baseUsername;
      let count = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${count++}`;
      }

      user = await User.create({
        name,
        email,
        username,
        phone: "0000000000", // 🔹 placeholder
        type: "customer",
        authProvider: "google",
        address: {
          state: "N/A",
          city: "N/A",
          fullAddress: "Signed up with Google",
        },
      });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        type: user.type,
        address: user.address,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
