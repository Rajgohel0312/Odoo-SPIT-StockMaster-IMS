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
    { to: "/warehouses", label: "Settings: Warehouses" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-8 tracking-wide">StockMaster</h2>

      <nav className="flex-grow space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition 
              ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
        onClick={logout}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
