import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "inventory_manager",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", form);
      alert("Signup successful, now login.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.error || "Error during signup");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="inventory_manager">Inventory Manager</option>
            <option value="warehouse_staff">Warehouse Staff</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
