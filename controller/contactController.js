const Contact = require("../models/Contact");

/* =========================
   ADD CONTACT MESSAGE
========================= */
exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   GET ALL CONTACT MESSAGES
========================= */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Fetch Contacts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   DELETE CONTACT MESSAGE
========================= */
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    await Contact.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
