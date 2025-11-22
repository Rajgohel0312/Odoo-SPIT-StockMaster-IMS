import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Delivery() {
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Delivery Orders (Outgoing Stock)
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Warehouse Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Warehouse
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              value={warehouseId}
              required
              onChange={e => setWarehouseId(e.target.value)}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || w.id})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Product Rows */}
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <select
                required
                value={item.productId}
                onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
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
                placeholder="Quantity"
                min="1"
                required
                value={item.qty}
                onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
              />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
            >
              + Add More Items
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
            >
              Validate Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
