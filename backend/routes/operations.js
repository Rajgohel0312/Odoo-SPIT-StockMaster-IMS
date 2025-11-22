const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const { recordOnChain } = require("../services/blockchain");

/* =============== helper: update stock & ledger ==================*/
const applyStockChange = async (
  batch,
  { productId, warehouseFrom, warehouseTo, qtyChange, type, operationId }
) => {
  const prodRef = db.collection("products").doc(productId);
  const prodSnap = await prodRef.get();

  const prodData = prodSnap.exists ? prodSnap.data() : {};
  const stockByWarehouse = prodData.stockByWarehouse || {};

  if (warehouseTo) {
    stockByWarehouse[warehouseTo] =
      (stockByWarehouse[warehouseTo] || 0) + qtyChange;
  }

  if (warehouseFrom && type === "TRANSFER") {
    stockByWarehouse[warehouseFrom] =
      (stockByWarehouse[warehouseFrom] || 0) - Math.abs(qtyChange);
  }

  batch.set(prodRef, { stockByWarehouse }, { merge: true });

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
    const userId = req.user?.uid || "system";

    const opRef = db.collection("operations").doc();
    const batch = db.batch();

    batch.set(opRef, {
      type: "RECEIPT",
      status: "DONE",
      warehouseId,
      items,
      createdBy: userId,
      notes: notes || "",
      createdAt: new Date(),
      validatedAt: new Date(),
    });

    for (const item of items) {
      await applyStockChange(batch, {
        productId: item.productId,
        warehouseTo: warehouseId,
        qtyChange: Number(item.qty),
        type: "RECEIPT",
        operationId: opRef.id,
      });
    }

    await batch.commit();

    const txHash = await recordOnChain(
      opRef.id,
      "RECEIPT",
      Math.floor(Date.now() / 1000)
    );
    await opRef.update({
      txHash,
      blockchainStatus: txHash ? "CONFIRMED" : "FAILED",
      explorerUrl: txHash
        ? `https://mumbai.polygonscan.com/tx/${txHash}`
        : null,
    });
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
    const txHash = await recordOnChain(
      opRef.id,
      "DELIVERY",
      Math.floor(Date.now() / 1000)
    );
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
    const txHash = await recordOnChain(
      opRef.id,
      "TRANSFER",
      Math.floor(Date.now() / 1000)
    );
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
    const txHash = await recordOnChain(
      opRef.id,
      "ADJUSTMENT",
      Math.floor(Date.now() / 1000)
    );
    res.json({ message: "Adjustment recorded", id: opRef.id, txHash });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =============== History ==================*/
router.get("/history", async (req, res) => {
  try {
    let { type, status, warehouseId, category, startDate, endDate } = req.query;

    let q = db.collection("operations");

    if (type) q = q.where("type", "==", type);
    if (status) q = q.where("status", "==", status);
    if (warehouseId)
      q = q
        .where("fromWarehouseId", "==", warehouseId)
        .where("toWarehouseId", "==", warehouseId);

    // Date filtering (createdAt)
    if (startDate && endDate) {
      q = q
        .where("createdAt", ">=", new Date(startDate))
        .where("createdAt", "<=", new Date(endDate));
    }

    const snap = await q.orderBy("createdAt", "desc").limit(100).get();
    const operations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filter Category from Products (JOIN-like behavior)
    if (category) {
      const prodSnap = await db
        .collection("products")
        .where("category", "==", category)
        .get();
      const productIds = prodSnap.docs.map((d) => d.id);
      operations = operations.filter((op) =>
        op.items.some((item) => productIds.includes(item.productId))
      );
    }

    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: "Failed to load operation history" });
  }
});

module.exports = router;
