import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Transfer() {
  const [fromWarehouseId, setFrom] = useState("");
  const [toWarehouseId, setTo] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

  // Load warehouses & products
  useEffect(() => {
    const unsubWarehouses = onSnapshot(collection(db, "warehouses"), snap => {
      setWarehouses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubWarehouses();
      unsubProducts();
    };
  }, []);

  // Handle form input
  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  // Add new product row
  const addRow = () => {
    setItems([...items, { productId: "", qty: "" }]);
  };

  const transferStock = async (e) => {
    e.preventDefault();

    if (!fromWarehouseId || !toWarehouseId) {
      return alert("Please select both warehouses.");
    }
    if (fromWarehouseId === toWarehouseId) {
      return alert("Source and destination warehouse cannot be the same.");
    }
    if (items.some(i => !i.productId || i.qty <= 0)) {
      return alert("Please enter valid product and quantity.");
    }

    try {
      const res = await api.post("/operations/transfer", {
        fromWarehouseId,
        toWarehouseId,
        items,
      });
      alert("Transfer Completed. Blockchain Tx: " + res.data.txHash);
    } catch (err) {
      alert("Transfer failed");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Internal Stock Transfer</h2>
      <form onSubmit={transferStock}>

        {/* From Warehouse */}
        <select required onChange={(e) => setFrom(e.target.value)}>
          <option value="">Select From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.code || w.id})
            </option>
          ))}
        </select>

        {/* To Warehouse */}
        <select required onChange={(e) => setTo(e.target.value)}>
          <option value="">Select To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.code || w.id})
            </option>
          ))}
        </select>

        {items.map((item, idx) => (
          <div key={idx} style={{ marginTop: "10px" }}>
            {/* Product dropdown */}
            <select
              required
              value={item.productId}
              onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Qty"
              required
              onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" onClick={addRow}>+ Add Product</button>
        <button type="submit">Transfer Stock</button>
      </form>
    </div>
  );
}
