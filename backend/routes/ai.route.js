import express from "express";
import authMiddleware  from "../middlewares/auth.middleware.js"; 
import * as aicontrollers from "../controllers/ai.controllers.js";
const router = express.Router();

router.post("/",authMiddleware, aicontrollers.aiResponse)

export default router;
