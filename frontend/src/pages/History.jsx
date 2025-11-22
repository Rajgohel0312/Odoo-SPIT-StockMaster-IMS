import { useState, useEffect } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  // Fetch data with filters
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

  // Export as Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([excelBuffer]), "operations-history.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📜 Operations History</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="RECEIPT">Receipt</option>
          <option value="DELIVERY">Delivery</option>
          <option value="TRANSFER">Transfer</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="WAITING">Waiting</option>
          <option value="READY">Ready</option>
          <option value="DONE">Completed</option>
        </select>

        <input
          type="text"
          placeholder="Warehouse ID"
          onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
        />

        <input
          type="text"
          placeholder="Category"
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />

        <button onClick={loadHistory}>🔍 Apply Filters</button>
        <button onClick={exportExcel}>📥 Export Excel</button>
      </div>

      {/* Table */}
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f1f1" }}>
            <th>Operation ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Warehouses</th>
            <th>Items</th>
            <th>Created At</th>
            <th>Blockchain Tx</th>
          </tr>
        </thead>
        <tbody>
          {history.map((op) => (
            <tr key={op.id}>
              <td>{op.id}</td>
              <td>{op.type}</td>
              <td>{op.status}</td>
              <td>
                From: {op.fromWarehouseId || "-"} <br />
                To: {op.toWarehouseId || "-"}
              </td>
              <td>
                {op.items?.map((i, idx) => (
                  <div key={idx}>
                    {i.productId} — Qty: {i.qty}
                  </div>
                ))}
              </td>
              <td>{op.createdAt?.toDate?.().toLocaleString() || "-"}</td>
              <td>
                {op.txHash ? (
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${op.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 View Tx
                  </a>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
