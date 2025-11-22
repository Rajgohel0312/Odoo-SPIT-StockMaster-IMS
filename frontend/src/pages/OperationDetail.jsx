import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function OperationDetail() {
  const { id } = useParams();
  const [op, setOp] = useState(null);

  useEffect(() => {
    api.get(`/operations/${id}`).then((res) => setOp(res.data));
  }, [id]);

  if (!op) return <p>Loading...</p>;

  return (
    <div>
      <h1>Operation {op.id}</h1>
      <p>Type: {op.type}</p>
      <p>Status: {op.status}</p>
      <p>
        From: {op.fromWarehouseId || "-"} | To: {op.toWarehouseId || "-"}
      </p>
      <p>Created By: {op.createdBy}</p>
      <p>Notes: {op.notes || "-"}</p>

      <h3>Items</h3>
      <ul>
        {op.items?.map((i, idx) => (
          <li key={idx}>
            {i.productId} — Qty: {i.qty}
          </li>
        ))}
      </ul>

      <h3>Blockchain</h3>
      {op.txHash ? (
        <a
          href={`https://mumbai.polygonscan.com/tx/${op.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          View Transaction
        </a>
      ) : (
        <p>No blockchain record.</p>
      )}
    </div>
  );
}
