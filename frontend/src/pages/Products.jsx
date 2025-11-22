import { useState, useEffect } from "react";
import api from "../api";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaWarehouse,
  FaPlusCircle,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    uom: "",
    reorderLevel: "",
  });

  // Real-time Firebase Sync
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();

    if (!form.name || !form.sku || !form.uom) {
      toast.warning("Please fill all required fields.");
      return;
    }
    if (form.reorderLevel < 0) {
      toast.error("Reorder level cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/products", form);
      toast.success("Product added successfully!");
      setForm({ name: "", sku: "", category: "", uom: "", reorderLevel: "" });
    } catch (err) {
      toast.error("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search text
  const filteredItems = items.filter((p) =>
    `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBoxOpen /> Products
      </h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 p-2 w-full border rounded-lg bg-gray-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <FaPlusCircle /> Add New Product
        </h2>

        <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["name", "sku", "category", "uom"].map((field, idx) => (
            <input
              key={idx}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              required={["name", "sku", "uom"].includes(field)}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            />
          ))}

          <input
            type="number"
            placeholder="Reorder Level"
            value={form.reorderLevel}
            onChange={(e) =>
              setForm({ ...form, reorderLevel: Number(e.target.value) })
            }
            className="p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <FaPlusCircle />
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((p) => {
          const totalStock = Object.values(p.stockByWarehouse || {}).reduce(
            (a, b) => a + b,
            0
          );
          return (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md border p-5 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {p.name} <span className="text-gray-500 text-sm">({p.sku})</span>
              </h3>

              <p className="text-sm text-gray-600 mb-1">
                Category: <span className="font-medium">{p.category || "-"}</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                UOM: <span className="font-medium">{p.uom}</span>
              </p>

              {/* Stock Overview */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3 border">
                <p className="text-sm font-semibold mb-1">Stock by Warehouse</p>
                {p.stockByWarehouse
                  ? Object.entries(p.stockByWarehouse).map(([warehouseId, qty]) => (
                      <p key={warehouseId} className="text-gray-700 text-sm flex items-center gap-1">
                        <FaWarehouse className="text-gray-500" /> {warehouseId}:
                        <span className="font-medium">{qty}</span>
                      </p>
                    ))
                  : "No stock available"}
              </div>

              {/* Footer Status */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{totalStock} units</span>
                {totalStock <= p.reorderLevel ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                    <FaTimesCircle /> Low Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                    <FaCheckCircle /> In Stock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
