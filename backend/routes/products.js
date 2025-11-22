const { db, auth } = require("../firebase");
const express = require("express");
const router = express.Router();

/* =============== Add Product  ==================*/
router.post("/", async (req, res) => {
  try {
    const { name, sku, category, uom, reorderLevel } = req.body;
    if (!name || !sku || !uom) {
      return res.status(400).json({
        error: "Missing required fields",
      });

      const docRef = await db.collection("products").add({
        name,
        sku,
        category: category || "Uncategorized",
        uom,
        reorderLevel: reorderLevel || 0,
        stockByWarehouse: {}, // {warehouseId: qty}
        createdAt: new Date(),
        isActive: true,
      });

      res.status(201).json({ id: docRef.id });
    }
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
});



/* =============== List Product  ==================*/
router.get("/", async (req, res) => {
  const snap = await db.collection("products").get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});