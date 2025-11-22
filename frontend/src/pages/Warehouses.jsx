import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import {
  FaWarehouse,
  FaMapMarkerAlt,
  FaCodeBranch,
  FaEdit,
  FaTrash,
  FaSave,
  FaPlusCircle,
} from "react-icons/fa";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      toast.error("Failed to load warehouses");
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return toast.warning("Name and Code are required");

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/warehouses/${editingId}`, form);
        toast.success("Warehouse updated successfully");
      } else {
        await api.post("/warehouses", form);
        toast.success("Warehouse added successfully");
      }
      setForm({ name: "", code: "", location: "" });
      setEditingId(null);
      loadWarehouses();
    } catch (err) {
      toast.error("Failed to save warehouse");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (w) => {
    setEditingId(w.id);
    setForm({ name: w.name, code: w.code, location: w.location || "" });
  };

  const removeWarehouse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      await api.delete(`/warehouses/${id}`);
      toast.success("Warehouse deleted");
      loadWarehouses();
    } catch (err) {
      toast.error("Failed to delete warehouse");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaWarehouse /> Warehouse Management
      </h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
        >
          <input
            placeholder="Warehouse Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-3 border rounded-lg bg-gray-50 focus:ring"
          />

          <input
            placeholder="Code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="p-3 border rounded-lg bg-gray-50 focus:ring"
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="p-3 border rounded-lg bg-gray-50 focus:ring"
          />

          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-3 flex items-center justify-center gap-2 py-3 rounded-lg shadow text-white transition
              ${
                editingId
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Saving..." : editingId ? <><FaSave /> Save Changes</> : <><FaPlusCircle /> Add Warehouse</>}
          </button>
        </form>
      </div>

      {/* Warehouse List - Cards instead of Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((w) => (
          <div
            key={w.id}
            className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaWarehouse className="text-blue-600" />
              {w.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <FaCodeBranch /> <span className="font-medium">{w.code}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <FaMapMarkerAlt /> {w.location || "No location specified"}
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => startEdit(w)}
                className="px-3 py-1 text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => removeWarehouse(w.id)}
                className="px-3 py-1 text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {warehouses.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No warehouses found.</p>
      )}
    </div>
  );
}
