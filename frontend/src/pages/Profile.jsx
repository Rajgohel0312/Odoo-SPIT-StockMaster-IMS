import { useState, useEffect } from "react";
import api from "../api";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaIdBadge, FaUserShield, FaClock } from "react-icons/fa";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-10 animate-pulse">Loading Profile...</p>;

  if (!user)
    return <p className="text-center text-red-500 mt-10">Profile not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaUser /> User Profile
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600 flex items-center gap-2 text-sm">
              <FaEnvelope /> {user.email}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">

          <Detail label="User ID" value={user.uid} icon={<FaIdBadge />} />

          <div>
            <span className="font-medium flex items-center gap-2">
              <FaUserShield /> Role:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-white text-sm mt-1 inline-block ${
                user.role === "admin"
                  ? "bg-purple-600"
                  : user.role === "inventory_manager"
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }`}
            >
              {user.role?.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <Detail label="Email" value={user.email} icon={<FaEnvelope />} />

         
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, icon, full }) {
  return (
    <p className={full ? "md:col-span-2" : ""}>
      <span className="font-medium flex items-center gap-2">
        {icon} {label}:
      </span>
      <span className="ml-6 text-gray-700">{value}</span>
    </p>
  );
}
