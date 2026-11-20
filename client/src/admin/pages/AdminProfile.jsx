import AdminLayout from "../components/AdminLayout.jsx";
import AdminIcon from "../components/AdminIcon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
};

const roleLabel = (role) => {
  if (!role) return "—";
  return role === "superadmin" ? "Super admin" : role.charAt(0).toUpperCase() + role.slice(1);
};

function DetailItem({ label, children }) {
  return (
    <div className="profile-item">
      <span className="profile-item-label">{label}</span>
      <span className="profile-item-value">{children}</span>
    </div>
  );
}

export default function AdminProfile() {
  const { admin, logout } = useAdminAuth();
  const initials = admin?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <AdminLayout>
      <div className="profile-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1>My profile</h1>
            <p className="page-subtitle">Your details as an administrator of Maharashtra Dairy.</p>
          </div>
        </header>

        <section className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-hero-text">
            <h2>{admin?.name || "Administrator"}</h2>
            <p>{admin?.email || "—"}</p>
            <div className="profile-badges">
              <span className="role-pill">{roleLabel(admin?.role)}</span>
              <span className={`status-pill ${admin?.isActive ? "is-active" : "is-inactive"}`}>
                <span className="status-dot" />
                {admin?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </section>

        <div className="profile-grid">
          <section className="settings-card">
            <div className="settings-card-head">
              <span className="settings-card-icon"><AdminIcon name="profile" size={18} /></span>
              <div>
                <h2>Account details</h2>
                <p>Information on file for this account.</p>
              </div>
            </div>
            <div className="profile-items">
              <DetailItem label="Full name">{admin?.name || "—"}</DetailItem>
              <DetailItem label="Email address">{admin?.email || "—"}</DetailItem>
              <DetailItem label="Role">{roleLabel(admin?.role)}</DetailItem>
              <DetailItem label="Member since">{admin?.createdAt ? formatDate(admin.createdAt) : "—"}</DetailItem>
              <DetailItem label="Last updated">{admin?.updatedAt ? formatDate(admin.updatedAt) : "—"}</DetailItem>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-head">
              <span className="settings-card-icon warn"><AdminIcon name="lock" size={18} /></span>
              <div>
                <h2>Password & sign-in</h2>
                <p>Contact your administrator to change your password or profile details.</p>
              </div>
            </div>
            <button type="button" className="btn btn-ghost settings-signout" onClick={logout}>
              <AdminIcon name="logout" size={16} />Sign out
            </button>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
