import express from "express";
import { createMessage, getMessages } from "../controllers/message.controllers.js";
import authMiddleware  from "../middlewares/auth.middleware.js"; // agar tumne banaya hai

const router = express.Router();

// Save message
router.post("/", authMiddleware, createMessage);

// Get all messages of a project
router.get("/:projectId", authMiddleware, getMessages);

export default router;
