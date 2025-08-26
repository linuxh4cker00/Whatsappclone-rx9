const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/encryption");

const router = express.Router();

// Middleware for auth
function authMiddleware(req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No token, auth denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token invalid" });
    }
}

// Send a message
router.post("/send", authMiddleware, async (req, res) => {
    const { receiverId, content } = req.body;
    try {
        const sender = await User.findById(req.user.id);
        const receiver = await User.findById(receiverId);

        if (receiver.blocked) {
            return res.status(403).json({ msg: "This user is blocked by admin." });
        }

        const encryptedMsg = encrypt(content);

        const newMsg = new Message({
            sender: sender._id,
            receiver: receiver._id,
            content: JSON.stringify(encryptedMsg),
            encrypted: true
        });

        await newMsg.save();

        res.json({ msg: "Message sent", message: newMsg });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Get chat between two users
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        // Decrypt before sending back
        const decryptedMessages = messages.map(m => {
            const decrypted = decrypt(JSON.parse(m.content));
            return { ...m._doc, content: decrypted };
        });

        res.json(decryptedMessages);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

module.exports = router;
