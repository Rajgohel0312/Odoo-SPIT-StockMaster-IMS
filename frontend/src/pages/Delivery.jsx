import { useState } from "react";
import api from "../api";

export default function Delivery() {
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

  // properly update items without mutating state
  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  const addRow = () => setItems([...items, { productId: "", qty: "" }]);

  const submitDelivery = async () => {
    try {
      const res = await api.post("/operations/delivery", { warehouseId, items });
      alert(`Delivery confirmed, tx: ${res.data.txHash}`);
    } catch (error) {
      alert("Failed to record delivery");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Delivery Orders</h2>
      <input placeholder="Warehouse ID" onChange={(e) => setWarehouseId(e.target.value)} />

      {items.map((item, idx) => (
        <div key={idx}>
          <input
            placeholder="Product ID"
            onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
          />
          <input
            placeholder="Qty"
            type="number"
            onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
          />
        </div>
      ))}

      <button type="button" onClick={addRow}>+ Add Item</button>
      <button onClick={submitDelivery}>Validate Delivery</button>
    </div>
  );
}
