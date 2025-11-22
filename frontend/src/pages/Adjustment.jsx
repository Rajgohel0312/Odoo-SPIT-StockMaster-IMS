import { useEffect, useState } from "react";
import api from "../api";
export default function Adjustment() {
  const [warehouseId, setWarehouse] = useState("");
  const [productId, setProduct] = useState("");
  const [countedQty, setQty] = useState("");

  const submitAdjustment = async () => {
    const res = await api.post("/operations/adjustment", {
      warehouseId,
      productId,
      countedQty: Number(countedQty),
    });
    alert("Adjustment Done. tx: " + res.data.txHash);
  };

  return (
    <div>
      <h2>Stock Adjustment</h2>
      <input placeholder="Warehouse ID" onChange={(e) => setWarehouse(e.target.value)} />
      <input placeholder="Product ID" onChange={(e) => setProduct(e.target.value)} />
      <input type="number" placeholder="Counted Quantity" onChange={(e) => setQty(e.target.value)} />
      <button onClick={submitAdjustment}>Adjust</button>
    </div>
  );
}
