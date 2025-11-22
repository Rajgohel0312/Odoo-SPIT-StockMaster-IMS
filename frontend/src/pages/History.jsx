import { useState, useEffect } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    warehouseId: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  const loadHistory = async () => {
    try {
      const res = await api.get("/operations/history", { params: filters });
      setHistory(res.data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    saveAs(new Blob([excelBuffer]), "operations-history.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        📜 Operations History
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select
            className="p-2 border rounded-lg bg-gray-50"
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="RECEIPT">Receipt</option>
            <option value="DELIVERY">Delivery</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>

          <select
            className="p-2 border rounded-lg bg-gray-50"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="WAITING">Waiting</option>
            <option value="READY">Ready</option>
            <option value="DONE">Completed</option>
          </select>

          <input
            type="text"
            placeholder="Warehouse ID"
            className="p-2 border rounded-lg"
            onChange={(e) =>
              setFilters({ ...filters, warehouseId: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Category"
            className="p-2 border rounded-lg"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          />

          <input
            type="date"
            className="p-2 border rounded-lg"
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <input
            type="date"
            className="p-2 border rounded-lg"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
          >
            🔍 Apply Filters
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Operation ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Warehouses</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Created At</th>
              <th className="p-3 text-left">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {history.map((op) => (
              <tr key={op.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Link
                    to={`/operations/${op.id}`}
                    className="text-blue-600 hover:underline hover:text-blue-800"
                  >
                    {op.id}
                  </Link>
                </td>
                <td className="p-3">{op.type}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      op.status === "DONE"
                        ? "bg-green-600"
                        : op.status === "WAITING"
                        ? "bg-yellow-500"
                        : op.status === "READY"
                        ? "bg-blue-600"
                        : "bg-gray-500"
                    }`}
                  >
                    {op.status}
                  </span>
                </td>
                <td className="p-3">
                  From: {op.fromWarehouseId || "-"} <br />
                  To: {op.toWarehouseId || "-"}
                </td>
                <td className="p-3">
                  {op.items?.map((i, idx) => (
                    <div key={idx}>
                      {i.productId} — Qty: {i.qty}
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  {op.createdAt?.toDate?.().toLocaleString() || "-"}
                </td>

                {/* 🔹 Local-only Blockchain Tx ID (no link) */}
                <td className="p-3">
                  {op.txHash ? (
                    <span className="bg-gray-200 px-2 py-1 rounded-md text-xs font-mono">
                      {op.txHash}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
