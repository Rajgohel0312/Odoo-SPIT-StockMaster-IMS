const express = require("express");
const router = express.Router();
const { db } = require("../index");
const { recordOnChain } = require("../services/blockchain");

/* =============== helper: update stock & ledger ==================*/
 
const applyStockChange = async (batch, {
  productId,
  warehouseFrom,
  warehouseTo,
  qtyChange,   // positive or negative for that warehouse
  type,
  operationId
}) => {
  const prodRef = db.collection("products").doc(productId);
  const prodSnap = await prodRef.get();
  const prodData = prodSnap.data();
  const stockByWarehouse = prodData.stockByWarehouse || {};

  if (warehouseTo) {
    const current = stockByWarehouse[warehouseTo] || 0;
    const newQty = current + qtyChange; // for receipts/delivery
    stockByWarehouse[warehouseTo] = newQty;
  }
  if (warehouseFrom && type === "TRANSFER") {
    const current = stockByWarehouse[warehouseFrom] || 0;
    const newQty = current - Math.abs(qtyChange);
    stockByWarehouse[warehouseFrom] = newQty;
  }

  batch.update(prodRef, { stockByWarehouse });

  const ledgerRef = db.collection("stock_ledger").doc();
  batch.set(ledgerRef, {
    productId,
    type,
    fromWarehouseId: warehouseFrom || null,
    toWarehouseId: warehouseTo || null,
    qtyChange,
    operationId,
    createdAt: new Date(),
  });
};

/* =============== Receipt ==================*/
router.post("/receipt", async (req, res) => {
  try {
    const { warehouseId, items, notes } = req.body;
    const userId = req.user.uid;

    const batch = db.batch();
    const opRef = db.collection("operations").doc();
    batch.set(opRef, {
      type: "RECEIPT",
      status: "DONE",
      fromWarehouseId: null,
      toWarehouseId: warehouseId,
      items,
      notes: notes || "",
      createdBy: userId,
      createdAt: new Date(),
      validatedAt: new Date(),
    });

    for (const item of items) {
      await applyStockChange(batch, {
        productId: item.productId,
        warehouseFrom: null,
        warehouseTo: warehouseId,
        qtyChange: item.qty,
        type: "RECEIPT",
        operationId: opRef.id,
      });
    }

    await batch.commit();
    const txHash = await recordOnChain(opRef.id, "RECEIPT", Math.floor(Date.now() / 1000));
    res.json({ message: "Receipt recorded", id: opRef.id, txHash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =============== Delivery ==================*/
router.post("/delivery", async (req, res) => {
  try {
    const { warehouseId, items, notes } = req.body;
    const userId = req.user.uid;

    const batch = db.batch();
    const opRef = db.collection("operations").doc();
    batch.set(opRef, {
      type: "DELIVERY",
      status: "DONE",
      fromWarehouseId: warehouseId,
      toWarehouseId: null,
      items,
      notes: notes || "",
      createdBy: userId,
      createdAt: new Date(),
      validatedAt: new Date(),
    });

    for (const item of items) {
      await applyStockChange(batch, {
        productId: item.productId,
        warehouseFrom: warehouseId,
        warehouseTo: null,
        qtyChange: -Math.abs(item.qty),
        type: "DELIVERY",
        operationId: opRef.id,
      });
    }

    await batch.commit();
    const txHash = await recordOnChain(opRef.id, "DELIVERY", Math.floor(Date.now() / 1000));
    res.json({ message: "Delivery recorded", id: opRef.id, txHash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =============== Transfer ==================*/
router.post("/transfer", async (req, res) => {
  try {
    const { fromWarehouseId, toWarehouseId, items, notes } = req.body;
    const userId = req.user.uid;

    const batch = db.batch();
    const opRef = db.collection("operations").doc();
    batch.set(opRef, {
      type: "TRANSFER",
      status: "DONE",
      fromWarehouseId,
      toWarehouseId,
      items,
      notes: notes || "",
      createdBy: userId,
      createdAt: new Date(),
      validatedAt: new Date(),
    });

    for (const item of items) {
      // subtract from source
      await applyStockChange(batch, {
        productId: item.productId,
        warehouseFrom: fromWarehouseId,
        warehouseTo: null,
        qtyChange: -Math.abs(item.qty),
        type: "TRANSFER",
        operationId: opRef.id,
      });
      // add to destination
      await applyStockChange(batch, {
        productId: item.productId,
        warehouseFrom: null,
        warehouseTo: toWarehouseId,
        qtyChange: item.qty,
        type: "TRANSFER",
        operationId: opRef.id,
      });
    }

    await batch.commit();
    const txHash = await recordOnChain(opRef.id, "TRANSFER", Math.floor(Date.now() / 1000));
    res.json({ message: "Transfer recorded", id: opRef.id, txHash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =============== Adjustment ==================*/
router.post("/adjustment", async (req, res) => {
  try {
    const { warehouseId, productId, countedQty, notes } = req.body;
    const userId = req.user.uid;

    const prodRef = db.collection("products").doc(productId);
    const prodSnap = await prodRef.get();
    const prodData = prodSnap.data();
    const stockByWarehouse = prodData.stockByWarehouse || {};
    const current = stockByWarehouse[warehouseId] || 0;
    const diff = countedQty - current; // + or -

    const batch = db.batch();
    const opRef = db.collection("operations").doc();
    batch.set(opRef, {
      type: "ADJUSTMENT",
      status: "DONE",
      fromWarehouseId: warehouseId,
      toWarehouseId: warehouseId,
      items: [{ productId, qty: diff }],
      notes: notes || "",
      createdBy: userId,
      createdAt: new Date(),
      validatedAt: new Date(),
    });

    await applyStockChange(batch, {
      productId,
      warehouseFrom: null,
      warehouseTo: warehouseId,
      qtyChange: diff,
      type: "ADJUSTMENT",
      operationId: opRef.id,
    });

    await batch.commit();
    const txHash = await recordOnChain(opRef.id, "ADJUSTMENT", Math.floor(Date.now() / 1000));
    res.json({ message: "Adjustment recorded", id: opRef.id, txHash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =============== History ==================*/
router.get("/history", async (req, res) => {
  const { type, status } = req.query;
  let q = db.collection("operations");

  if (type) q = q.where("type", "==", type);
  if (status) q = q.where("status", "==", status);

  const snap = await q.orderBy("createdAt", "desc").limit(100).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

module.exports = router;
