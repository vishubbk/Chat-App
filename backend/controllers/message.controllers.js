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
    const userId = req.user.id;
    const { projectId } = req.params;
    const messages = await Message.find({ projectId,deletedFor: { $ne: userId }, })
      .populate("sender", "email")
      .sort({ createdAt: 1 });
        

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//deleteMessages of a project
export const deleteMessages = async (req, res) => {
  try {
    const { messageId } = req.params;
      const userId = req.user.id;
      if (!messageId || !userId){
        return res.status(400).json({message:"Messages or User is undefined"})
      }

     const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

     if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ msg: "Message deleted for you", message });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
};  
      
