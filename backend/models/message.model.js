// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true }, // 👈 text ko content me badal do
  sender: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
