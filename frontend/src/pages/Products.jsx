import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", sku: "", category: "", uom: "", reorderLevel: 0 });

  // Real-time Firebase Sync
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", form);
      alert("Product Added Successfully");
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={addProduct}>
        <input placeholder="Name" required onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="SKU" required onChange={e => setForm({ ...form, sku: e.target.value })} />
        <input placeholder="Category" onChange={e => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Unit of Measure" required onChange={e => setForm({ ...form, uom: e.target.value })} />
        <input type="number" placeholder="Reorder Level" onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
        <button type="submit">Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>UoM</th>
            <th>Stock Per Warehouse</th>
            <th>Total Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => {
            const totalStock = Object.values(p.stockByWarehouse || {}).reduce((a, b) => a + b, 0);
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{p.uom}</td>
                <td>
                  {p.stockByWarehouse
                    ? Object.entries(p.stockByWarehouse).map(([warehouseId, qty]) => (
                        <div key={warehouseId}>{warehouseId}: {qty}</div>
                      ))
                    : "No Stock"}
                </td>
                <td>{totalStock}</td>
                <td>
                  {totalStock <= p.reorderLevel
                    ? <span style={{ color: "red" }}>Low Stock ⚠️</span>
                    : "OK"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
