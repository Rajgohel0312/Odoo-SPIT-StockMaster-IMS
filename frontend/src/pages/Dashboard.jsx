import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Products: {data.totalProducts}</p>
      <p>Low Stock Items: {data.lowStockCount}</p>
      <p>Pending Receipts: {data.pendingReceipts}</p>
      <p>Pending Deliveries: {data.pendingDeliveries}</p>
      <p>Internal Transfers: {data.internalTransfers}</p>
    </div>
  );
}
