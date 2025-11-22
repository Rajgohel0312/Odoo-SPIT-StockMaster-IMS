import { useState, useEffect } from "react";
import api from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error("Profile fetch error:", err));
  }, []);

  if (!user)
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">👤 User Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          
          <p>
            <span className="font-medium">UID:</span> {user.uid}
          </p>

          <p>
            <span className="font-medium">Name:</span> {user.name}
          </p>

          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>

          <p>
            <span className="font-medium">Role:</span>{" "}
            <span
              className={`px-3 py-1 rounded-full text-white text-sm ${
                user.role === "admin"
                  ? "bg-purple-600"
                  : user.role === "inventory_manager"
                  ? "bg-blue-600"
                  : "bg-gray-600"
              }`}
            >
              {user.role}
            </span>
          </p>

          <p className="md:col-span-2">
            <span className="font-medium">Joined:</span>{" "}
            {user.createdAt?.toDate?.()
              ? new Date(user.createdAt.toDate()).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
