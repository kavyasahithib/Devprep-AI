const express = require("express");
const router = express.Router();
const { getSettingsPublic, getSettings, updateSettings } = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

router.get("/public", getSettingsPublic);
router.get("/", authMiddleware, admin, getSettings);
router.put("/", authMiddleware, admin, updateSettings);

module.exports = router;
