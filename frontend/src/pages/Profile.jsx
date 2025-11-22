import { useState, useEffect } from "react";
import api from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/profile")
      .then(res => setUser(res.data))
      .catch(err => console.error("Profile fetch error:", err));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>UID:</strong> {user.uid}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Joined:</strong> {user.createdAt?.toDate?.().toString()}</p>
    </div>
  );
}
