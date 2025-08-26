const express = require("express");
const User = require("../models/User");

const router = express.Router();
const ADMIN_KEY = "26785401r/";

// Middleware for admin auth
function adminAuth(req, res, next) {
    const key = req.header("x-admin-key");
    if (key !== ADMIN_KEY) return res.status(401).json({ msg: "Unauthorized" });
    next();
}

// Ban user by number
router.post("/ban", adminAuth, async (req, res) => {
    const { number } = req.body;
    try {
        const user = await User.findOne({ number });
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.blocked = true;
        await user.save();
        res.json({ msg: `User ${number} has been banned.` });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Unban user
router.post("/unban", adminAuth, async (req, res) => {
    const { number } = req.body;
    try {
        const user = await User.findOne({ number });
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.blocked = false;
        await user.save();
        res.json({ msg: `User ${number} has been unbanned.` });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Report user (just log for now)
router.post("/report", adminAuth, async (req, res) => {
    const { number, reason } = req.body;
    console.log(`⚠️ Reported User ${number}: ${reason}`);
    res.json({ msg: `Report logged for ${number}` });
});

module.exports = router;
