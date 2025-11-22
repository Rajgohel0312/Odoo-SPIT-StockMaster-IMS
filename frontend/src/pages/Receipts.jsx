import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  FaWarehouse,
  FaBoxOpen,
  FaPlusCircle,
  FaTrash,
  FaClipboardCheck,
} from "react-icons/fa";

export default function Receipts() {
  const [warehouseId, setWarehouseId] = useState("");
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

  const addRow = () => {
    setItems([...items, { productId: "", qty: "" }]);
  };

  const removeRow = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouseId) return toast.warning("Please select a warehouse");
    if (items.some((i) => !i.productId || i.qty <= 0))
      return toast.error("Enter valid product and quantity");

    setLoading(true);
    try {
      const res = await api.post("/operations/receipt", { warehouseId, items });
      toast.success(`Receipt Recorded! Tx: ${res.data.txHash}`);
      setItems([{ productId: "", qty: "" }]);
      setWarehouseId("");
    } catch (err) {
      toast.error("Error recording receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaClipboardCheck /> Record Incoming Stock
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Warehouse Dropdown */}
          <div>
            <label className="block mb-1 font-medium text-gray-600 flex items-center gap-2">
              <FaWarehouse /> Select Warehouse
            </label>
            <select
              value={warehouseId}
              required
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none shadow-sm"
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
              <div
                key={idx}
                className="flex items-center gap-3 border p-3 rounded-lg bg-gray-50"
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
                  placeholder="Qty"
                  min="1"
                  required
                  value={item.qty}
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
            className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
          >
            <FaPlusCircle /> Add More Items
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <FaClipboardCheck />
            {loading ? "Submitting..." : "Submit Receipt"}
          </button>
        </form>
      </div>
    </div>
  );
}
