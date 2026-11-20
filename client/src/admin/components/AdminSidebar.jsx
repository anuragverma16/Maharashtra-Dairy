import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import AdminIcon from "./AdminIcon.jsx";

const menuSections = [
  {
    title: "Overview",
    items: [{ icon: "dashboard", label: "Dashboard", path: "/admin/dashboard" }],
  },
  {
    title: "Catalogue",
    items: [
      { icon: "products", label: "Products", path: "/admin/products" },
      { icon: "add", label: "Add Product", path: "/admin/products/add" },
    ],
  },
  {
    title: "Customers",
    items: [{ icon: "enquiries", label: "Enquiries", path: "/admin/enquiries" }],
  },
  {
    title: "Account",
    items: [
      { icon: "settings", label: "Settings", path: "/admin/settings" },
      { icon: "profile", label: "Profile", path: "/admin/profile" },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAdminAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-info"><h2>Maharashtra Dairy</h2><p>Administration</p></div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar"><AdminIcon name="close" /></button>
        </div>
        <nav className="sidebar-menu" aria-label="Admin navigation">
          {menuSections.map((section) => (
            <div className="menu-section" key={section.title}>
              <p className="menu-section-title">{section.title}</p>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  onClick={onClose}
                >
                  <AdminIcon name={item.icon} className="menu-icon" />
                  <span className="menu-label">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-logout" onClick={logout}><AdminIcon name="logout" />Logout</button>
        </div>
      </aside>
    </>
  );
}
