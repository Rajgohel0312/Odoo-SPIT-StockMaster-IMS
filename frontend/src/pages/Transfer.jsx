import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  FaExchangeAlt,
  FaWarehouse,
  FaBoxOpen,
  FaPlusCircle,
  FaTrash,
  FaPaperPlane,
} from "react-icons/fa";

export default function Transfer() {
  const [fromWarehouseId, setFrom] = useState("");
  const [toWarehouseId, setTo] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", qty: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubWarehouses = onSnapshot(collection(db, "warehouses"), (snap) =>
      setWarehouses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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

  const addRow = () => setItems([...items, { productId: "", qty: "" }]);

  const removeRow = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const transferStock = async (e) => {
    e.preventDefault();

    if (!fromWarehouseId || !toWarehouseId)
      return toast.warning("Please select both warehouses.");
    if (fromWarehouseId === toWarehouseId)
      return toast.error("Source and destination warehouse cannot be the same.");
    if (items.some((i) => !i.productId || i.qty <= 0))
      return toast.error("Please enter valid product and quantity.");

    setLoading(true);
    try {
      const res = await api.post("/operations/transfer", {
        fromWarehouseId,
        toWarehouseId,
        items,
      });
      toast.success(`Transfer Completed! Tx: ${res.data.txHash}`);
      setItems([{ productId: "", qty: "" }]);
      setFrom("");
      setTo("");
    } catch (err) {
      toast.error("Transfer failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaExchangeAlt /> Internal Stock Transfer
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={transferStock} className="space-y-6">

          {/* Warehouse Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-600 mb-1 flex items-center gap-2">
                <FaWarehouse /> From Warehouse
              </label>
              <select
                required
                value={fromWarehouseId}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code || w.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-600 mb-1 flex items-center gap-2">
                <FaWarehouse /> To Warehouse
              </label>
              <select
                required
                value={toWarehouseId}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code || w.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-gray-50 p-3 border rounded-lg"
              >
                <select
                  required
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(idx, "productId", e.target.value)
                  }
                  className="flex-1 p-2 border rounded-lg bg-white focus:ring outline-none"
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
                  min="1"
                  placeholder="Qty"
                  required
                  value={item.qty || ""}
                  onChange={(e) =>
                    handleItemChange(idx, "qty", Number(e.target.value))
                  }
                  className="w-28 p-2 border rounded-lg focus:ring outline-none"
                />

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addRow}
            className="text-blue-600 hover:underline text-sm flex items-center gap-2"
          >
            <FaPlusCircle /> Add Another Product
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <FaPaperPlane /> {loading ? "Processing..." : "Transfer Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
