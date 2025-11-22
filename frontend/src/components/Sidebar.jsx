import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthProvider";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/profile", label: "Profile" },
    { to: "/products", label: "Products" },
    { to: "/receipts", label: "Receipts" },
    { to: "/delivery", label: "Delivery Orders" },
    { to: "/transfer", label: "Internal Transfers" },
    { to: "/adjustment", label: "Stock Adjustments" },
    { to: "/history", label: "History" },
  ];

  return (
    <aside className="sidebar">
      <h2>StockMaster</h2>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="nav-link">
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="logout-btn" onClick={logout}>
        🚪 Logout
      </button>
    </aside>
  );
}
