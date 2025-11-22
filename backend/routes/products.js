const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authenticate = require("../middleware/authenticate");

/* =============== Add Product ==================*/
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      name,
      sku,
      category,       // simple string for now, or categoryId if you later create categories collection
      uom,
      reorderLevel,
      initialStock,
      defaultWarehouseId,
    } = req.body;

    if (!name || !sku || !uom) {
      return res.status(400).json({ error: "Name, SKU and UoM are required" });
    }

    const stockByWarehouse = {};
    const initQty = Number(initialStock) || 0;
    if (initQty > 0 && defaultWarehouseId) {
      stockByWarehouse[defaultWarehouseId] = initQty;
    }

    const docRef = await db.collection("products").add({
      name,
      sku,
      category: category || "Uncategorized",
      uom,
      reorderLevel: Number(reorderLevel) || 0,
      stockByWarehouse,
      createdAt: new Date(),
      isActive: true,
    });

    res.status(201).json({ id: docRef.id, message: "Product added" });
  } catch (error) {
    console.error("Product Add Error:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

/* =============== List Products ==================*/
router.get("/", authenticate, async (req, res) => {
  try {
    const snap = await db.collection("products").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (error) {
    console.error("Product Fetch Error:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

/* =============== Update Product ==================*/
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      category,
      uom,
      reorderLevel,
      isActive,
    } = req.body;

    await db.collection("products").doc(id).update({
      ...(name !== undefined && { name }),
      ...(sku !== undefined && { sku }),
      ...(category !== undefined && { category }),
      ...(uom !== undefined && { uom }),
      ...(reorderLevel !== undefined && { reorderLevel: Number(reorderLevel) }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    });

    res.json({ message: "Product updated" });
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* =============== Delete Product ==================*/
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").doc(id).delete();
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product Delete Error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
