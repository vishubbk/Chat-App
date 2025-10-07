import Message from "../models/message.model.js";

// Save new message
export const createMessage = async (req, res) => {
  try {
    const { projectId, sender, content } = req.body;

    if (!projectId || !sender || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({ projectId, sender, content });
    await newMessage.save();

    return res.status(201).json({ message: "Message saved", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all messages of a project
export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ projectId })
      .populate("sender", "email")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
