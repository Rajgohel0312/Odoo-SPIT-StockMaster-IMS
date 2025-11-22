const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/* =============== Add Product ==================*/
router.post("/", async (req, res) => {
  try {
    const { name, sku, category, uom, reorderLevel } = req.body;

    if (!name || !sku || !uom) {
      return res.status(400).json({ error: "Name, SKU and UoM are required" });
    }

    const docRef = await db.collection("products").add({
      name,
      sku,
      category: category || "Uncategorized",
      uom,
      reorderLevel: Number(reorderLevel) || 0,
      stockByWarehouse: {},
      createdAt: new Date(),
      isActive: true,
    });

    res.status(201).json({ id: docRef.id, message: "Product added successfully" });
  } catch (error) {
    console.error("Product Add Error:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

/* =============== List Products ==================*/
router.get("/", async (req, res) => {
  try {
    const snap = await db.collection("products").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (error) {
    console.error("Product Fetch Error:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

module.exports = router;
