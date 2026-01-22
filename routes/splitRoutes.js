const express = require("express");
const router = express.Router();
const { getSplitDetails } = require("../controller/splitController");
const auth = require("../middleware/authMiddleware");

router.get("/:cartCode", auth, getSplitDetails);

module.exports = router;
