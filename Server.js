const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/admin", require("./routes/admin"));

// Socket.IO for real-time chat
io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socket.on("sendMessage", (msg) => {
        io.emit("receiveMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
