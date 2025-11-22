import { useState, useEffect } from "react";
import api from "../api";

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", sku: "", category: "", uom: "", reorderLevel: 0 });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    api.get("/products").then(res => setItems(res.data)).catch(console.error);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", form);
      alert("Product Added Successfully");
      loadProducts();
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
        <input placeholder="UoM" required onChange={e => setForm({ ...form, uom: e.target.value })} />
        <input type="number" placeholder="Reorder Level" onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
        <button type="submit">Add</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>SKU</th><th>Category</th><th>UoM</th></tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td>{p.uom}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
