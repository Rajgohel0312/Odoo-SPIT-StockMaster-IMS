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

  const removeRow = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
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
      alert("Transfer Completed. Transaction: " + res.data.txHash);
    } catch (err) {
      alert("Transfer failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        🔄 Internal Stock Transfer
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <form onSubmit={transferStock} className="space-y-6">

          {/* From Warehouse */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              From Warehouse
            </label>
            <select
              required
              value={fromWarehouseId}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Choose Warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || w.id})
                </option>
              ))}
            </select>
          </div>

          {/* To Warehouse */}
          <div>
            <label className="block mb-1 font-medium text-gray-600">
              To Warehouse
            </label>
            <select
              required
              value={toWarehouseId}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Choose Warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || w.id})
                </option>
              ))}
            </select>
          </div>

          {/* Product Items */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                
                <select
                  required
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="">Select Product...</option>
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
                  className="w-28 p-2 border rounded-lg"
                  onChange={(e) =>
                    handleItemChange(idx, "qty", Number(e.target.value))
                  }
                />

                {/* ❌ Remove Item Button */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ➕ Add Row Button */}
          <button
            type="button"
            onClick={addRow}
            className="text-blue-600 hover:underline text-sm"
          >
            ➕ Add Product
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition"
          >
            Transfer Stock
          </button>
        </form>
      </div>
    </div>
  );
}
