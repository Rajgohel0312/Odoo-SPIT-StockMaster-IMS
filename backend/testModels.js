require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

(async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",   // or gemini-pro
      contents: [
        { role: "user", parts: [{ text: "Hello, explain inventory management simply." }] }
      ]
    });

    console.log("\n🧪 AI Test Response:\n");
    console.log(response.text);
  } catch (error) {
    console.error("\n❌ AI Test Failed:\n", error.message || error);
  }
})();
