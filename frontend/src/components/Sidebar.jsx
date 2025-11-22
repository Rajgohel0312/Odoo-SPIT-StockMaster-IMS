import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthProvider";
import { toast } from "react-toastify";
import {
  FaTachometerAlt,
  FaUser,
  FaHistory,
  FaRobot,
  FaBox,
  FaTruckLoading,
  FaTruck,
  FaWarehouse,
  FaExchangeAlt,
  FaTools,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const { logout, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully!", { autoClose: 2000 });
    navigate("/");
  };

  // 🔹 With icons
  const commonLinks = [
    { to: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/profile", label: "Profile", icon: <FaUser /> },
    { to: "/history", label: "History", icon: <FaHistory /> },
    { to: "/ai", label: "AI Assistant", icon: <FaRobot /> },
  ];

  const managerLinks = [
    { to: "/products", label: "Products", icon: <FaBox /> },
    { to: "/delivery", label: "Delivery Orders", icon: <FaTruck /> },
    { to: "/warehouses", label: "Warehouses", icon: <FaWarehouse /> },
  ];

  const staffLinks = [
    { to: "/receipts", label: "Receipts", icon: <FaTruckLoading /> },
    { to: "/transfer", label: "Internal Transfers", icon: <FaExchangeAlt /> },
    { to: "/adjustment", label: "Stock Adjustments", icon: <FaTools /> },
  ];

  const links = [
    ...commonLinks,
    ...(role === "inventory_manager" ? managerLinks : []),
    ...(role === "warehouse_staff" ? staffLinks : []),
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 tracking-wide text-center">
        StockMaster
      </h2>

      <nav className="flex-grow space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
        onClick={handleLogout}
      >
        <FaSignOutAlt className="text-lg" /> Logout
      </button>
    </aside>
  );
}
