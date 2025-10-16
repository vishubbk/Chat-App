// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true }, // 👈 sender ka userId ya username
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  timestamp: { type: Date, default: Date.now },

  // 🧠 NEW FIELD: Track who deleted the message
  deletedFor: [
    {
      type: String, // userId or username (same type as sender)
    },
  ],
});

export default mongoose.model("Message", messageSchema);
