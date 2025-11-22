const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const authenticate = require("../middleware/authenticate");

router.post("/", authenticate, async (req, res) => {
  try {
    const { name, code, location, managerId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Name and code are required" });
    }

    const docRef = await db.collection("warehouses").add({
      name,
      code,
      location: location || "",
      managerId: managerId || null,
      createdAt: new Date(),
      isActive: true,
    });

    res.status(201).json({ id: docRef.id, message: "Warehouse created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const snap = await db.collection("warehouses").get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, location, managerId, isActive } = req.body;

    await db.collection("warehouses").doc(id).update({
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(location !== undefined && { location }),
      ...(managerId !== undefined && { managerId }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    });

    res.json({ message: "Warehouse updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("warehouses").doc(id).delete();
    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
