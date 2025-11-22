require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askAI(query, context = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let safeContext = "";
    try {
      safeContext = JSON.stringify(context, null, 2);
    } catch {
      safeContext = "Context unavailable due to formatting.";
    }

    const prompt = `
### 📦 StockMaster Inventory Assistant

You are an expert AI assistant for Inventory Management, Logistics, and Stock Optimization.

📌 **Response Formatting Rules (MANDATORY):**
1️⃣ Always respond in **clean Markdown**, no HTML.
2️⃣ For inventory data, always use **valid Markdown tables**, not plain text.
3️⃣ Every table must:
   - Start and end each row with **|**
   - Use correct separator row: \`|---|---|\`
   - Have **NO extra spaces**, **NO blank columns**, **NO extra trailing pipes**
4️⃣ **Never wrap tables in code blocks (\`\`\`)**
5️⃣ If data is missing or empty, reply with: \`_No matching records found_\`
6️⃣ Use headings (###), bullet lists, and bold labels where useful.
7️⃣ Give clean, readable output — no debug text.

📊 Available Inventory Data:
${safeContext}

💬 **User Query:**
${query}

🛠 **Example of a perfectly formatted table**:

| Product ID | Name | SKU | Category | UOM | Reorder Level | Current Stock | Status |
|------------|------|------|----------|-----|---------------|---------------|--------|
| ABC123     | Steel Rod | SR-01 | Metals | Kg | 10 | 3 | Low Stock |
`;

    const result = await model.generateContent(prompt);
    return result.response.text() || "⚠️ No AI response.";
  } catch (error) {
    console.error("AI Chat Error:", error?.message || error);
    return "⚠️ AI failed to respond. Check API settings.";
  }
}

module.exports = { askAI };
