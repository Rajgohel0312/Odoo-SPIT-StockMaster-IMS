import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthProvider";
export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const links = [{ to: "/", label: "Dashboard" }];

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
