const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  deleteContact,
} = require("../controller/contactController");

/* PUBLIC – Contact Us Page */
router.post("/add", createContact);

/* ADMIN – Dashboard */
router.get("/all", getAllContacts);
router.delete("/:id", deleteContact);

module.exports = router;
