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
    <div>
      <h1>Warehouses</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Code"
          required
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.code}</td>
              <td>{w.location}</td>
              <td>
                <button onClick={() => startEdit(w)}>Edit</button>
                <button onClick={() => removeWarehouse(w.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
