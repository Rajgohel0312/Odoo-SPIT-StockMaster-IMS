import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Delivery() {
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

  // Load warehouses & products from Firestore
  useEffect(() => {
    const unsubWarehouses = onSnapshot(collection(db, "warehouses"), snap =>
      setWarehouses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubProducts = onSnapshot(collection(db, "products"), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubWarehouses();
      unsubProducts();
    };
  }, []);

  // Update product rows correctly
  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { productId: "", qty: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!warehouseId) return alert("Please select a warehouse!");
    if (items.some(i => !i.productId || i.qty <= 0))
      return alert("Please select a valid product and quantity");

    try {
      const res = await api.post("/operations/delivery", { warehouseId, items });
      alert(`Delivery Successful! Blockchain Tx: ${res.data.txHash}`);
    } catch (error) {
      alert("Failed to record delivery");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Delivery Orders (Outgoing Stock)</h2>
      <form onSubmit={handleSubmit}>

        {/* 🔹 Warehouse Dropdown */}
        <select value={warehouseId} required onChange={e => setWarehouseId(e.target.value)}>
          <option value="">Select Warehouse</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.code || w.id})
            </option>
          ))}
        </select>

        {items.map((item, idx) => (
          <div key={idx} style={{ marginTop: "10px" }}>

            {/* 🔹 Product Dropdown */}
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
              placeholder="Qty"
              min="1"
              required
              onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" onClick={addRow}>+ Add More Items</button>
        <button type="submit">Validate Delivery</button>
      </form>
    </div>
  );
}
