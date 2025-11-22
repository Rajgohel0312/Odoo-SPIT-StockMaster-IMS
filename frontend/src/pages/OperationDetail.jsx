import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaClipboardList,
  FaWarehouse,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaHourglassHalf,
  FaTruckMoving,
  FaFileInvoice,
  FaBoxOpen,
  FaHashtag,
} from "react-icons/fa";

export default function OperationDetail() {
  const { id } = useParams();
  const [op, setOp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/operations/${id}`)
      .then((res) => setOp(res.data))
      .catch(() => toast.error("Failed to load operation details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10 animate-pulse">
        Loading Operation Details...
      </p>
    );

  if (!op)
    return (
      <p className="text-center text-red-500 mt-10">
        ❌ Operation Not Found.
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Back Button */}
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <FaArrowLeft /> Back to History
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaClipboardList /> Operation Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <DetailItem label="Operation ID" value={op.id} icon={<FaHashtag />} />
          <DetailItem label="Type" value={op.type} icon={<FaTruckMoving />} />

          <div>
            <span className="font-medium flex items-center gap-2">
              <FaCheckCircle /> Status:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-white text-sm mt-1 inline-block ${
                op.status === "DONE"
                  ? "bg-green-600"
                  : op.status === "WAITING"
                  ? "bg-yellow-500"
                  : "bg-blue-600"
              }`}
            >
              {op.status}
            </span>
          </div>

          <DetailItem label="Created By" value={op.createdBy || "-"} icon={<FaUser />} />
          <DetailItem label="From Warehouse" value={op.fromWarehouseId || "-"} icon={<FaWarehouse />} />
          <DetailItem label="To Warehouse" value={op.toWarehouseId || "-"} icon={<FaWarehouse />} />

          <div className="md:col-span-2">
            <span className="font-medium flex items-center gap-2">
              <FaClipboardList /> Notes:
            </span>
            <p className="bg-gray-50 p-3 rounded-lg border mt-1">
              {op.notes || "—"}
            </p>
          </div>

          <DetailItem
            label="Created At"
            value={op.createdAt?.toDate?.().toLocaleString() || "-"}
            icon={<FaClock />}
            full
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBoxOpen /> Items
        </h3>

        {op.items?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {op.items.map((i, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition"
              >
                <p className="font-medium flex items-center gap-2">
                  <FaHashtag /> Product ID: {i.productId}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaBoxOpen /> Quantity: {i.qty}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </div>

      {/* Blockchain Info */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileInvoice /> Blockchain Record
        </h3>
        {op.txHash ? (
          <p className="text-gray-700">
            <span className="font-medium">Transaction ID:</span>{" "}
            <span className="bg-gray-200 px-3 py-1 rounded-md text-sm font-mono">
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

/* Reusable component */
function DetailItem({ label, value, icon, full }) {
  return (
    <p className={full ? "md:col-span-2" : ""}>
      <span className="font-medium flex items-center gap-2">
        {icon} {label}:
      </span>
      <span className="ml-6 text-gray-700">{value}</span>
    </p>
  );
}
