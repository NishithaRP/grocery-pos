import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/items", label: "Items & Prices" },
  { to: "/billing", label: "New Bill" },
  { to: "/reports", label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand">
        Govi Mart
        <span>Shop management</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">v0.1 · single-user mode</div>
    </aside>
  );
}
