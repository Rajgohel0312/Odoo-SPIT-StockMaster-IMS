import { useState } from "react";
import api from "../api";

export default function Receipts() {
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([{ productId: "", qty: "" }]);

  // Handle input change correctly (immutable state update)
  const handleItemChange = (idx, field, value) => {
    const updatedItems = [...items];
    updatedItems[idx][field] = value;
    setItems(updatedItems);
  };

  // Add more product rows
  const addRow = () => {
    setItems([...items, { productId: "", qty: "" }]);
  };

  // Submit receipt
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/operations/receipt", { warehouseId, items });
      alert(`Receipt successful! Blockchain Tx: ${res.data.txHash}`);
    } catch (err) {
      alert("Failed to record receipt");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Record Incoming Stock</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Warehouse ID"
          required
          onChange={(e) => setWarehouseId(e.target.value)}
        />

        {items.map((item, idx) => (
          <div key={idx} style={{ marginTop: "10px" }}>
            <input
              placeholder="Product ID"
              required
              onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              required
              onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" onClick={addRow}>
          + Add More Items
        </button>
        <button type="submit">Submit Receipt</button>
      </form>
    </div>
  );
}
