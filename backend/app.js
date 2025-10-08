import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import user from "./routes/user.route.js";
import project from "./routes/project.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";


connect();

const app = express();

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ CORS Setup
app.use(
  cors({
    origin: ["https://chat-app-t3hq.onrender.com","http://localhost:5173"], // tumhara React frontend ka URL
    credentials: true, // cookies ko allow karne ke liye
  })
);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/user", user);
app.use("/project", project);
app.use("/aiHelp", aiRoutes);

app.use("/api/messages", messageRoutes);




export default app;
