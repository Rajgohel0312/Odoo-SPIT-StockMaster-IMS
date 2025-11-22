import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function OperationDetail() {
  const { id } = useParams();
  const [op, setOp] = useState(null);

  useEffect(() => {
    api.get(`/operations/${id}`).then((res) => setOp(res.data));
  }, [id]);

  if (!op) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Link to="/history" className="inline-block mb-4 text-blue-600 hover:underline">
        ← Back to History
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Operation Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><span className="font-medium">Operation ID:</span> {op.id}</p>
          <p><span className="font-medium">Type:</span> {op.type}</p>

          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-3 py-1 rounded-full text-white text-sm ${
                op.status === "DONE"
                  ? "bg-green-600"
                  : op.status === "WAITING"
                  ? "bg-yellow-500"
                  : "bg-blue-600"
              }`}
            >
              {op.status}
            </span>
          </p>

          <p>
            <span className="font-medium">Created By:</span> {op.createdBy || "-"}
          </p>

          <p>
            <span className="font-medium">From:</span> {op.fromWarehouseId || "-"}
          </p>
          <p>
            <span className="font-medium">To:</span> {op.toWarehouseId || "-"}
          </p>

          <p className="md:col-span-2">
            <span className="font-medium">Notes:</span> {op.notes || "-"}
          </p>

          <p className="md:col-span-2">
            <span className="font-medium">Created At:</span>{" "}
            {op.createdAt?.toDate?.().toLocaleString() || "-"}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
        {op.items?.length > 0 ? (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Product ID</th>
                <th className="p-3 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {op.items.map((i, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="p-3">{i.productId}</td>
                  <td className="p-3">{i.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </div>

      {/* Blockchain Info - Local Only */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Blockchain Record
        </h3>
        {op.txHash ? (
          <p className="text-gray-700">
            <span className="font-medium">Transaction ID:</span>{" "}
            <span className="bg-gray-200 px-2 py-1 rounded-md text-sm font-mono">
              {op.txHash}
            </span>
          </p>
        ) : (
          <p className="text-gray-500">No blockchain record.</p>
        )}
      </div>
    </div>
  );
}
