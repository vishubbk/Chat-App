import {aiService} from "../services/ai.service.js";


export const aiResponse = async (req, res) => {
  try {
    // accept both "query" or "message"
    const query = req.body.query || req.body.message;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Please provide a valid query string." });
    }

    const responseQuery = await aiService(query);
    res.json({ response: responseQuery });
  } catch (error) {
    console.error("Error in aiResponse:", error);
    res.status(500).json({ error: "AI service failed, please try again." });
  }
};
