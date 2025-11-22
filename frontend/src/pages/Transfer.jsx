import { useState } from "react";
import api from "../api";

export default function Transfer() {
  const [fromWarehouseId, setFrom] = useState("");
  const [toWarehouseId, setTo] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

  const transferStock = async () => {
    const res = await api.post("/operations/transfer", {
      fromWarehouseId,
      toWarehouseId,
      items,
    });
    alert("Transfer Completed. tx: " + res.data.txHash);
  };

  return (
    <div>
      <h2>Transfer Stock</h2>
      <input
        placeholder="From Warehouse"
        onChange={(e) => setFrom(e.target.value)}
      />
      <input
        placeholder="To Warehouse"
        onChange={(e) => setTo(e.target.value)}
      />
      {items.map((i, idx) => (
        <div key={idx}>
          <input
            placeholder="Product ID"
            onChange={(e) => (items[idx].productId = e.target.value)}
          />
          <input
            placeholder="Qty"
            type="number"
            onChange={(e) => (items[idx].qty = Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={transferStock}>Transfer</button>
    </div>
  );
}
