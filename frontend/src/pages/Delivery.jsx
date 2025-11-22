import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import {
  FaPlus,
  FaTrash,
  FaTruckMoving,
  FaWarehouse,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function Delivery() {
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
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!warehouseId) return toast.warning("Please select a warehouse!");
    if (items.some((i) => !i.productId || i.qty <= 0))
      return toast.error("Please select valid products and quantities!");

    try {
      setLoading(true);
      const res = await api.post("/operations/delivery", {
        warehouseId,
        items,
      });
      toast.success(
        `Delivery Successful! Transaction Hash: ${
          res.data.txHash || "Processing"
        }`
      );

      setItems([{ productId: "", qty: "" }]);
      setWarehouseId("");
    } catch (error) {
      toast.error("Failed to record delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaTruckMoving /> Delivery Orders (Outgoing)
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warehouse Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
              <FaWarehouse /> Select Warehouse
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              value={warehouseId}
              required
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || w.id})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Product Rows */}
          {items.map((item, idx) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50 shadow-sm"
              >
                {/* Product Dropdown */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-sm flex items-center gap-2">
                    <FaBoxOpen /> Product
                  </label>
                  <select
                    required
                    value={item.productId}
                    onChange={(e) =>
                      handleItemChange(idx, "productId", e.target.value)
                    }
                    className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>

                  {product && (
                    <p className="text-xs mt-1 text-gray-600">
                      Stock:{" "}
                      <span className="font-semibold">
                        {product.quantity || 0}
                      </span>
                    </p>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="text-gray-700 text-sm flex items-center gap-2">
                    <FaCheckCircle /> Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="Enter Quantity"
                    min="1"
                    required
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(idx, "qty", Number(e.target.value))
                    }
                    className="p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>

                {/* Remove Button */}
                <div className="flex justify-end items-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition shadow"
            >
              <FaPlus /> Add Item
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FaCheckCircle />
              {loading ? "Processing..." : "Validate Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
