import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
    api.get("/alerts/low-stock").then((res) => setLowStock(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div>
          <h3>Total Products</h3>
          <p>{data.totalProducts}</p>
        </div>
        <div>
          <h3>Low Stock Items</h3>
          <p>{data.lowStockCount}</p>
        </div>
        <div>
          <h3>Pending Receipts</h3>
          <p>{data.pendingReceipts}</p>
        </div>
        <div>
          <h3>Pending Deliveries</h3>
          <p>{data.pendingDeliveries}</p>
        </div>
        <div>
          <h3>Internal Transfers</h3>
          <p>{data.internalTransfers}</p>
        </div>
      </div>

      <h2>Low Stock Alerts</h2>
      {lowStock.length === 0 ? (
        <p>✅ No low stock items.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td style={{ color: "red" }}>{p.totalStock}</td>
                <td>{p.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
