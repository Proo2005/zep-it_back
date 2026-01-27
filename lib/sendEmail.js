import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password
  },
});

export default async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Zep-It Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
