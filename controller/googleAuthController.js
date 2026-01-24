const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { generateToken } = require("../lib/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    // If user does not exist → create
    if (!user) {
      user = await User.create({
        name,
        email,
        type: "customer",
        password: "GOOGLE_AUTH",
        address: {
          state: "NA",
          city: "NA",
          fullAddress: "Google Login",
        },
      });
    }

    const token = generateToken({
      id: user._id,
      type: user.type,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        address: user.address,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
};
