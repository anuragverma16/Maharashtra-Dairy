import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import AdminIcon from "./AdminIcon.jsx";

export default function AdminHeader({ onMenuToggle }) {
  const { admin } = useAdminAuth();
  const initials = admin?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu"><AdminIcon name="menu" /></button>
        <div className="header-branding"><img className="header-logo" src="/logo-emblem.png" alt="" aria-hidden="true" /><span className="header-title">Maharashtra Dairy</span><span className="header-context">Admin</span></div>
      </div>
      {admin && <div className="header-right"><div className="admin-info"><div className="admin-avatar">{initials}</div><div className="admin-details"><span className="admin-name">{admin.name}</span><span className="admin-role">{admin.role}</span></div></div></div>}
    </header>
  );
}
