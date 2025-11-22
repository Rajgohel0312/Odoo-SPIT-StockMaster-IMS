import { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaTruckLoading,
  FaTruckMoving,
  FaExchangeAlt
} from "react-icons/fa";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await api.get("/dashboard");
        const lowStockRes = await api.get("/alerts/low-stock");
        setData(dashboardRes.data);
        setLowStock(lowStockRes.data);
      } catch (error) {
        toast.error("Failed to load dashboard data!");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 mt-10 animate-pulse">
        Loading Dashboard...
      </div>
    );

  if (!data)
    return (
      <p className="text-center text-red-500 mt-10">
        ⚠️ Unable to load data. Please try again later.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

      {/* Summary Cards with Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Products", value: data.totalProducts, icon: <FaBoxOpen /> },
          { label: "Low Stock Items", value: data.lowStockCount, icon: <FaExclamationTriangle /> },
          { label: "Pending Receipts", value: data.pendingReceipts, icon: <FaTruckLoading /> },
          { label: "Pending Deliveries", value: data.pendingDeliveries, icon: <FaTruckMoving /> },
          { label: "Internal Transfers", value: data.internalTransfers, icon: <FaExchangeAlt /> },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center hover:shadow-lg transition"
          >
            <div className="text-2xl mb-2 text-blue-600">{item.icon}</div>
            <h3 className="text-gray-600 text-sm">{item.label}</h3>
            <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" /> Low Stock Alerts
        </h2>

        {lowStock.length === 0 ? (
          <p className="text-green-600 font-medium">🎉 All items are sufficiently stocked.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-red-50 transition"
                >
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 text-red-600 font-semibold">{p.totalStock}</td>
                  <td className="p-3">{p.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
