import { useState, useEffect } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaDownload,
} from "react-icons/fa";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const res = await api.get("/operations/history", { params: filters });
      setHistory(res.data);
      if (!res.data.length) toast.info("No matching records found.");
    } catch (err) {
      toast.error("Error loading history!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const exportExcel = () => {
    if (!history.length) {
      toast.warning("No data available to export!");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    saveAs(new Blob([excelBuffer]), "operations-history.xlsx");
    toast.success("📥 Excel Exported Successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📜 Operations History
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 mb-6">
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

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
          >
            <FaSearch />
            {loading ? "Loading..." : "Apply Filters"}
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
          >
            <FaDownload /> Export Excel
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
              alt="No Data"
              className="w-28 mb-3 opacity-70"
            />
            <p className="text-lg font-medium">No history records found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 sticky top-0 shadow-sm">
                <tr>
                  {[
                    "Operation ID",
                    "Type",
                    "Status",
                    "Warehouses",
                    "Items",
                    "Created At",
                    "Transaction ID",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-gray-600 font-semibold border-b text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {history.map((op, idx) => (
                  <tr
                    key={op.id}
                    className={`border-b transition hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-blue-600">
                      <Link
                        to={`/operations/${op.id}`}
                        className="hover:underline"
                      >
                        {op.id}
                      </Link>
                    </td>

                    <td className="px-4 py-3 font-medium">{op.type}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 w-fit
                  ${
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

                    <td className="px-4 py-3 text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>{" "}
                        {op.fromWarehouseId || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>{" "}
                        {op.toWarehouseId || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {op.items?.map((i, iIdx) => (
                        <div key={iIdx} className="border-b last:border-0 py-1">
                          <span className="font-semibold">{i.productId}</span> — Qty:{" "}
                          <span className="text-gray-700">{i.qty}</span>
                        </div>
                      ))}
                    </td>

                    <td className="px-4 py-3">
                      {op.createdAt?.toDate?.().toLocaleString() || "-"}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs bg-gray-100 rounded p-2">
                      {op.txHash || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
