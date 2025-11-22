import { useEffect, useState } from "react";
import api from "../api";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", location: "" });
  const [editingId, setEditingId] = useState(null);

  const loadWarehouses = async () => {
    try {
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to load warehouses", err);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/warehouses/${editingId}`, form);
      } else {
        await api.post("/warehouses", form);
      }
      setForm({ name: "", code: "", location: "" });
      setEditingId(null);
      loadWarehouses();
    } catch (err) {
      alert("Failed to save warehouse");
      console.error(err);
    }
  };

  const startEdit = (w) => {
    setEditingId(w.id);
    setForm({ name: w.name, code: w.code, location: w.location || "" });
  };

  const removeWarehouse = async (id) => {
    if (!window.confirm("Delete this warehouse?")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      loadWarehouses();
    } catch (err) {
      alert("Failed to delete warehouse");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">🏭 Warehouses</h1>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <input
            placeholder="Warehouse Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded-lg"
          />

          <input
            placeholder="Code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="p-2 border rounded-lg"
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="p-2 border rounded-lg"
          />

          <button
            type="submit"
            className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition"
          >
            {editingId ? "Save Changes" : "Add Warehouse"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{w.name}</td>
                <td className="p-3">{w.code}</td>
                <td className="p-3">{w.location || "—"}</td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => startEdit(w)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeWarehouse(w.id)}
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan="4">
                  No warehouses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
