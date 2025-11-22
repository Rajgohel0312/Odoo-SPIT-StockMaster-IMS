import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", sku: "", category: "", uom: "", reorderLevel: 0 });

  // 🔹 Real-time Firebase Sync
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
      setForm({ name: "", sku: "", category: "", uom: "", reorderLevel: 0 }); // Reset after submit
    } catch (err) {
      alert("Error adding product");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">📦 Products</h1>

      {/* Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Product</h2>
        <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "name", placeholder: "Product Name", required: true },
            { name: "sku", placeholder: "SKU", required: true },
            { name: "category", placeholder: "Category", required: false },
            { name: "uom", placeholder: "Unit of Measure", required: true },
          ].map((field, idx) => (
            <input
              key={idx}
              placeholder={field.placeholder}
              required={field.required}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          ))}

          <input
            type="number"
            placeholder="Reorder Level"
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })}
            className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
          />

          <button
            type="submit"
            className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition"
          >
            ➕ Add Product
          </button>
        </form>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">UoM</th>
              <th className="p-3 text-left">Stock by Warehouse</th>
              <th className="p-3 text-left">Total Stock</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const totalStock = Object.values(p.stockByWarehouse || {}).reduce(
                (a, b) => a + b,
                0
              );
              return (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.category || "-"}</td>
                  <td className="p-3">{p.uom}</td>
                  <td className="p-3">
                    {p.stockByWarehouse
                      ? Object.entries(p.stockByWarehouse).map(([warehouseId, qty]) => (
                          <div key={warehouseId} className="text-sm">
                            {warehouseId}: <span className="font-medium">{qty}</span>
                          </div>
                        ))
                      : "No Stock"}
                  </td>
                  <td className="p-3 font-medium">{totalStock}</td>
                  <td className="p-3">
                    {totalStock <= p.reorderLevel ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        Low Stock ⚠️
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        In Stock 🟢
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
