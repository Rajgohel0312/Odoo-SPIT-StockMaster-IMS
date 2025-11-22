const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  try {
    console.log("📌 Dashboard API Called");

    // Fetch products
    const productSnap = await db.collection("products").get();
    const products = productSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalProducts = products.length;

    // Low stock calculation
    const lowStockCount = products.filter(p => {
      const totalStock = p.stockByWarehouse
        ? Object.values(p.stockByWarehouse).reduce((a, b) => a + (Number(b) || 0), 0)
        : 0;
      return p.reorderLevel && totalStock <= p.reorderLevel;
    }).length;

    // Fetch operations
    const opSnap = await db.collection("operations")
      .where("status", "in", ["DRAFT", "WAITING", "READY"])
      .get();

    let pendingReceipts = 0, pendingDeliveries = 0, internalTransfers = 0;

    opSnap.forEach(doc => {
      const data = doc.data();
      if (data.type === "RECEIPT") pendingReceipts++;
      if (data.type === "DELIVERY") pendingDeliveries++;
      if (data.type === "TRANSFER") internalTransfers++;
    });

    res.json({
      totalProducts,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries,
      internalTransfers,
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

module.exports = router;
