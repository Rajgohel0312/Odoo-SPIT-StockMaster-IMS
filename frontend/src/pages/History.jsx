import { useEffect, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function History() {
  const [records, setRecords] = useState([]);
  const [filterType, setFilterType] = useState("");

  const loadHistory = () => {
    api.get(`/operations/history${filterType ? `?type=${filterType}` : ""}`)
      .then((res) => setRecords(res.data));
  };

  useEffect(() => { loadHistory(); }, [filterType]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buffer]), "history.xlsx");
  };

  return (
    <div>
      <h1>Stock Movement History</h1>

      <select onChange={(e) => setFilterType(e.target.value)}>
        <option value="">All</option>
        <option value="RECEIPT">Receipt</option>
        <option value="DELIVERY">Delivery</option>
        <option value="TRANSFER">Transfer</option>
        <option value="ADJUSTMENT">Adjustment</option>
      </select>

      <button onClick={exportExcel}>Export to Excel</button>

      <table>
        <thead>
          <tr>
            <th>Operation ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>From → To</th>
            <th>Blockchain Tx</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td>{r.fromWarehouseId || "-"} → {r.toWarehouseId || "-"}</td>
              <td>
                {r.txHash ? (
                  <a href={`https://sepolia.etherscan.io/tx/${r.txHash}`} target="_blank">
                    Verify
                  </a>
                ) : "Not Recorded"}
              </td>
              <td>{new Date(r.createdAt?.seconds * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
