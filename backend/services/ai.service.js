import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const aiService = async (prompt) => {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `You are an expert in MERN and Development.
            You have 10 years of experience in development.
            You always write modular code, break it into files,
            use clear comments, handle errors, cover edge cases,
            and follow best practices to make code scalable and maintainable.`
          }
        ]
      }
    });

    // ✅ Generate content
    const response = await model.generateContent([{ text: prompt }]);

    // ✅ Extract text safely
    return response?.response?.text() || "AI could not generate a response.";
  } catch (error) {
    console.error("Error generating content:", error);

    // ✅ Fallback response so chat never breaks
    return "AI is currently unavailable. Please try again later.";
  }
};
