import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/message.model.js";
import { isFloat32Array } from "util/types";
import { aiService } from "./services/ai.service.js";


const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const io = new Server(server, {
  cors: { origin: "*" },
});

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return next(new Error("Authentication error"));

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  const projectId = socket.handshake.query.projectId;
  console.log(`projectId ${projectId}`);

  if (projectId) socket.join(projectId);

  // Send message
socket.on("send-message", async (data) => {
  try {
    const { content } = data;
    if (!content || !projectId) return;

    // Save user's message first
    const newMessage = new Message({
      content,
      sender: socket.user.email,
      projectId,
    });

    await newMessage.save();

    // Broadcast user's message
    io.to(projectId).emit("new-message", {
      _id: newMessage._id,
      content: newMessage.content,
      sender: newMessage.sender,
      projectId: newMessage.projectId,
      timestamp: newMessage.timestamp,
    });

    const userMessage = content.toLowerCase();

    // Check for AI trigger
    if (userMessage.includes("@ai")) {

      const userQuery = content.replace("@ai", "");
      const aiResponse = await aiService(userQuery);

      // Save AI message in DB
      const aiMessage = new Message({
        content: aiResponse,
        sender: "ai",
        projectId,
      });

      await aiMessage.save();

      // Broadcast AI message
      io.to(projectId).emit("new-message", {
        _id: aiMessage._id,
        content: aiMessage.content,
        sender: aiMessage.sender,
        projectId: aiMessage.projectId,
        timestamp: aiMessage.timestamp,
      });
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.email);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
