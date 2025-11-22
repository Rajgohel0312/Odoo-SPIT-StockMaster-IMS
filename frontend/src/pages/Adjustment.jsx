import { useEffect, useState } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  FaWarehouse,
  FaBoxOpen,
  FaHashtag,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

export default function Adjustment() {
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [countedQty, setQty] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load warehouses and products
  useEffect(() => {
    const unsubWarehouses = onSnapshot(collection(db, "warehouses"), (snap) => {
      setWarehouses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });

    return () => {
      unsubWarehouses();
      unsubProducts();
    };
  }, []);

  const submitAdjustment = async () => {
    if (!warehouseId) return toast.warning("Please select a warehouse!");
    if (!productId) return toast.warning("Please select a product!");
    if (countedQty === "" || countedQty < 0)
      return toast.error("Enter a valid counted quantity!");

    try {
      setLoading(true);
      const res = await api.post("/operations/adjustment", {
        warehouseId,
        productId,
        countedQty: Number(countedQty),
      });
      toast.success("Adjustment recorded successfully! TX: " + res.data.txHash);

      // Reset Inputs
      setWarehouseId("");
      setProductId("");
      setQty("");
      setSelectedProduct(null);
    } catch (err) {
      toast.error("Failed to record adjustment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const id = e.target.value;
    setProductId(id);
    setSelectedProduct(products.find((p) => p.id === id));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaTools /> Stock Adjustment
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-5">

        {/* Warehouse Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaWarehouse /> Select Warehouse
          </label>
          <select
            value={warehouseId}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
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

        {/* Product Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaBoxOpen /> Select Product
          </label>
          <select
            value={productId}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={handleProductChange}
          >
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Show product details (optional UX) */}
          {selectedProduct && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
              <p><strong>SKU:</strong> {selectedProduct.sku}</p>
              <p><strong>Current Stock:</strong> {selectedProduct.quantity || 0}</p>
            </div>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaHashtag /> Counted Quantity
          </label>
          <input
            type="number"
            min="0"
            value={countedQty}
            placeholder="Enter Quantity"
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={submitAdjustment}
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition font-medium flex items-center justify-center gap-2 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <FaCheckCircle />
          {loading ? "Recording Adjustment..." : "Adjust Stock"}
        </button>
      </div>
    </div>
  );
}
