import { useState } from "react";
import api from "../api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "inventory_manager" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", form);
      alert("Signup successful, now login.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="auth-box">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="inventory_manager">Inventory Manager</option>
          <option value="warehouse_staff">Warehouse Staff</option>
        </select>
        <button>Signup</button>
      </form>
    </div>
  );
}
