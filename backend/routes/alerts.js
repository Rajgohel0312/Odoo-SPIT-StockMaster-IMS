const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authenticate = require("../middleware/authenticate");

/**
 * GET /api/alerts/low-stock
 */
router.get("/low-stock", authenticate, async (req, res) => {
  try {
    const snap = await db.collection("products").get();
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const lowStock = products
      .map((p) => {
        const totalStock = p.stockByWarehouse
          ? Object.values(p.stockByWarehouse).reduce(
              (a, b) => a + (Number(b) || 0),
              0
            )
          : 0;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          uom: p.uom,
          totalStock,
          reorderLevel: p.reorderLevel || 0,
        };
      })
      .filter((p) => p.totalStock <= p.reorderLevel);

    res.json(lowStock);
  } catch (err) {
    console.error("Low stock alert error:", err);
    res.status(500).json({ error: "Failed to load low stock alerts" });
  }
});

module.exports = router;
