import AdminLayout from "../components/AdminLayout.jsx";
import AdminIcon from "../components/AdminIcon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const companyInfo = {
  name: "Maharashtra Dairy",
  email: "bmainuddin30@gmail.com",
  phone: "+91-9930022119",
  address: "Valsang Taluka, District Solapur, Maharashtra, India",
};

const panelFeatures = [
  { icon: "dashboard", title: "Dashboard", text: "Key numbers and recent enquiries at a glance." },
  { icon: "products", title: "Product management", text: "Add, edit, photograph and show or hide products." },
  { icon: "enquiries", title: "Customer enquiries", text: "Read, resolve and remove messages from customers." },
];

function InfoItem({ label, children }) {
  return (
    <div className="settings-item">
      <span className="settings-item-label">{label}</span>
      <span className="settings-item-value">{children}</span>
    </div>
  );
}

export default function AdminSettings() {
  const { admin, logout } = useAdminAuth();

  return (
    <AdminLayout>
      <div className="settings-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Configuration</p>
            <h1>Settings</h1>
            <p className="page-subtitle">Company details, your admin account and panel information.</p>
          </div>
        </header>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="settings-card-head">
              <span className="settings-card-icon"><AdminIcon name="content" size={18} /></span>
              <div>
                <h2>Company information</h2>
                <p>Shown on the public website and in enquiries.</p>
              </div>
            </div>
            <div className="settings-items">
              <InfoItem label="Company name">{companyInfo.name}</InfoItem>
              <InfoItem label="Email">
                <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
              </InfoItem>
              <InfoItem label="Phone">
                <a href={`tel:${companyInfo.phone.replace(/\s/g, "")}`}>{companyInfo.phone}</a>
              </InfoItem>
              <InfoItem label="Address">{companyInfo.address}</InfoItem>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-head">
              <span className="settings-card-icon"><AdminIcon name="profile" size={18} /></span>
              <div>
                <h2>Your admin account</h2>
                <p>The account you are signed in with.</p>
              </div>
            </div>
            <div className="settings-items">
              <InfoItem label="Name">{admin?.name || "—"}</InfoItem>
              <InfoItem label="Email">{admin?.email || "—"}</InfoItem>
              <InfoItem label="Role">
                <span className="role-pill">{admin?.role || "—"}</span>
              </InfoItem>
            </div>
          </section>

          <section className="settings-card settings-card-wide">
            <div className="settings-card-head">
              <span className="settings-card-icon"><AdminIcon name="dashboard" size={18} /></span>
              <div>
                <h2>About this admin panel</h2>
                <p>What you can manage from here.</p>
              </div>
            </div>
            <ul className="feature-list">
              {panelFeatures.map((item) => (
                <li key={item.title}>
                  <span className="feature-icon"><AdminIcon name={item.icon} size={18} /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="settings-card settings-card-security">
            <div className="settings-card-head">
              <span className="settings-card-icon warn"><AdminIcon name="lock" size={18} /></span>
              <div>
                <h2>Security</h2>
                <p>Keep your sign-in private. Sign out when you finish, especially on shared computers.</p>
              </div>
            </div>
            <button type="button" className="btn btn-ghost settings-signout" onClick={logout}>
              <AdminIcon name="logout" size={16} />Sign out of this device
            </button>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
