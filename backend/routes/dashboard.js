const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  try {
    const productSnap = await db.collection("products").get();
    const products = productSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const totalProducts = products.length;

    const lowStockCount = products.filter((p) => {
      const totalStock = p.stockByWarehouse
        ? Object.values(p.stockByWarehouse).reduce(
            (a, b) => a + (Number(b) || 0),
            0
          )
        : 0;
      return p.reorderLevel && totalStock <= p.reorderLevel;
    }).length;

    const pendingReceipts = await db
      .collection("operations")
      .where("type", "==", "RECEIPT")
      .where("status", "in", ["DRAFT", "WAITING", "READY"])
      .get()
      .then((snap) => snap.size);

    const pendingDeliveries = await db
      .collection("operations")
      .where("type", "==", "DELIVERY")
      .where("status", "in", ["DRAFT", "WAITING", "READY"])
      .get()
      .then((snap) => snap.size);

    const internalTransfers = await db
      .collection("operations")
      .where("type", "==", "TRANSFER")
      .where("status", "in", ["DRAFT", "WAITING", "READY"])
      .get()
      .then((snap) => snap.size);

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
