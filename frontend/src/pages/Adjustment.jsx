import { useEffect, useState } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

export default function Adjustment() {
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [countedQty, setQty] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Load warehouses and products
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

  const submitAdjustment = async () => {
    if (!warehouseId) return alert("Please select a warehouse!");
    if (!productId) return alert("Please select a product!");
    if (countedQty === "" || countedQty < 0)
      return alert("Enter a valid counted quantity!");

    try {
      const res = await api.post("/operations/adjustment", {
        warehouseId,
        productId,
        countedQty: Number(countedQty),
      });
      alert("Adjustment recorded successfully! Tx: " + res.data.txHash);
    } catch (err) {
      alert("Failed to record adjustment");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Stock Adjustment
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
        
        {/* Warehouse Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Select Warehouse
          </label>
          <select
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code || w.id})
              </option>
            ))}
          </select>
        </div>

        {/* Product Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Select Product
          </label>
          <select
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Counted Quantity
          </label>
          <input
            type="number"
            min="0"
            placeholder="Enter Quantity"
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={submitAdjustment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition font-medium"
        >
          Adjust Stock
        </button>
      </div>
    </div>
  );
}
