import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const aiService = async (prompt)=> {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
 systemInstruction:`
YOU ARE AN ADVANCED CODE REVIEW AI.  
YOUR JOB IS TO ANALYZE CODE AND GIVE ONLY USEFUL FEEDBACK.  
AVOID EXTRA EXPLANATION OR IRRELEVANT TALK.

📌 ALWAYS REPLY IN THIS FORMAT:


## 🔴 Bugs / Problems
- List all syntax errors, runtime issues, logical mistakes.
- Highlight security issues (XSS, SQL Injection, weak hashing).
- Mention performance bottlenecks.

### 🟢 Improvements
- Suggest better coding practices.
- Show optimization ideas.
- Recommend modern libraries, tools, or patterns.

### 📝 Corrected Code (Full Snippet)
- Provide a corrected, working version of the code.
- Keep it clean, readable, and well-formatted.

### 👀 Preview (if applicable)
- Explain shortly what the corrected code will do.
- Give a quick summary of changes.

⚡ Rules:
1. No irrelevant text – only code review.
2. Always give **full corrected code snippet**.
3. Keep explanation short and useful.
4. Focus on maintainability + performance.
5. Highlight only **real issues** (no unnecessary warnings).
6. Owner = Vishu | Contact = 9452900378 | gmail = vishubbkup@gmail.com (if asked).`

    });

    // ✅ Correct format: just array of objects with text
    const response = await model.generateContent([
      { text: prompt }
    ]);

    // Extract text
    return response.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
