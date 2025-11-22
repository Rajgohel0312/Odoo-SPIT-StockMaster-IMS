const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const { askAI } = require("../services/aiAssistant");

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Send inventory context to AI (product names, stock, warehouse info)
    const snap = await db.collection("products").get();
    const products = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const aiReply = await askAI(message, JSON.stringify(products));

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ reply: "⚠️ AI failed to process message." });
  }
});

module.exports = router;
