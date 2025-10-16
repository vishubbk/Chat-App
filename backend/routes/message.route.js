import express from "express";
import { createMessage, getMessages ,deleteMessages} from "../controllers/message.controllers.js";
import authMiddleware  from "../middlewares/auth.middleware.js"; 

const router = express.Router();

// Save message
router.post("/", authMiddleware, createMessage);

// Get all messages of a project
router.get("/:projectId", authMiddleware, getMessages);

// Delete messages of a project
router.put("/deleteMessage/:messageId", authMiddleware, deleteMessages);

export default router;
