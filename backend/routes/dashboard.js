const express = require("express");
const router = express.Router();
const { db } = require("../index");

router.get("/", async (req, res) => {
  const productSnap = await db.collection("products").get();
  const products = productSnap.docs.map((d) => d.data());

  const totalProducts = products.length;

  const lowStockCount = products.filter((p) => {
    const total = Object.values(p.stockByWarehouse || {}).reduce(
      (a, b) => a + b,
      0
    );
    return p.reorderLevel && total <= p.reorderLevel;
  }).length;

  const opSnap = await db
    .collection("operations")
    .where("status", "in", ["DRAFT", "WAITING", "READY"])
    .get();

  let pendingReceipts = 0;
  let pendingDeliveries = 0;
  let internalTransfers = 0;

  opSnap.forEach((doc) => {
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
});

module.exports = router;
