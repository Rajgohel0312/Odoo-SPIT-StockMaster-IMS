import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
    api.get("/alerts/low-stock").then((res) => setLowStock(res.data));
  }, []);

  if (!data) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Products", value: data.totalProducts },
          { label: "Low Stock Items", value: data.lowStockCount },
          { label: "Pending Receipts", value: data.pendingReceipts },
          { label: "Pending Deliveries", value: data.pendingDeliveries },
          { label: "Internal Transfers", value: data.internalTransfers },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-100 text-center"
          >
            <h3 className="text-gray-600 text-sm">{item.label}</h3>
            <p className="text-2xl font-semibold text-gray-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Low Stock Alerts
        </h2>

        {lowStock.length === 0 ? (
          <p className="text-green-600">✅ No low stock items.</p>
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
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 text-red-600 font-medium">{p.totalStock}</td>
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
