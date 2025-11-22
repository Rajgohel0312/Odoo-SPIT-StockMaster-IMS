import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard" },
   
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
    </aside>
  );
}
