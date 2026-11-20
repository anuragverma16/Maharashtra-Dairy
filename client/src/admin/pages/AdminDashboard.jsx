import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminIcon from "../components/AdminIcon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { fetchDashboardStats, fetchAdminContacts } from "../services/adminApi.js";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const [statsData, contacts] = await Promise.all([
          fetchDashboardStats(),
          fetchAdminContacts(),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setRecentEnquiries(Array.isArray(contacts) ? contacts.slice(0, 5) : []);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Total Products", value: stats?.totalProducts, icon: "products", tone: "blue" },
    { label: "Available", value: stats?.availableProducts, icon: "available", tone: "green" },
    { label: "Unavailable", value: stats?.unavailableProducts, icon: "unavailable", tone: "slate" },
    { label: "Total Enquiries", value: stats?.totalEnquiries, icon: "enquiries", tone: "blue" },
    { label: "Unread Enquiries", value: stats?.unreadEnquiries, icon: "new", tone: "amber" },
    { label: "Unresolved", value: stats?.unresolvedEnquiries, icon: "pending", tone: "slate" },
  ];

  const availablePct = percent(stats?.availableProducts, stats?.totalProducts);
  const resolvedPct = percent(
    (stats?.totalEnquiries ?? 0) - (stats?.unresolvedEnquiries ?? 0),
    stats?.totalEnquiries
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Welcome back{admin?.name ? `, ${admin.name}` : ""}</h1>
            <p className="dashboard-subtitle">A live summary of your products and customer enquiries.</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/admin/products/add" className="btn btn-primary-dark">
              <AdminIcon name="add" size={16} />Add product
            </Link>
            <Link to="/admin/enquiries" className="btn btn-ghost">
              <AdminIcon name="enquiries" size={16} />View enquiries
            </Link>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="stats-grid">
          {cards.map((card) => (
            <section className="stat-card" key={card.label}>
              <div className={`stat-icon ${card.tone}`}>
                <AdminIcon name={card.icon} size={21} />
              </div>
              <div className="stat-content">
                <h3>{card.label}</h3>
                <p className="stat-value">{card.value ?? 0}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>Recent Enquiries</h2>
                <p>Latest messages received from your customers.</p>
              </div>
              <Link to="/admin/enquiries" className="link-muted">See all</Link>
            </div>

            {recentEnquiries.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnquiries.map((enquiry) => (
                      <tr key={enquiry._id} className={enquiry.isRead ? "" : "unread"}>
                        <td className="enquiry-name">{enquiry.name || "—"}</td>
                        <td>{enquiry.email || "—"}</td>
                        <td>{enquiry.subject || "—"}</td>
                        <td>{formatDate(enquiry.createdAt)}</td>
                        <td>
                          <span className={`badge ${enquiry.isResolved ? "resolved" : "pending"}`}>
                            {enquiry.isResolved ? "Resolved" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No enquiries yet</p>
            )}
          </section>

          <aside className="dashboard-section insight-panel">
            <div className="section-heading">
              <div>
                <h2>Health</h2>
                <p>Catalogue availability and enquiry follow-up.</p>
              </div>
            </div>

            <div className="insight">
              <div className="insight-row">
                <span>Products available</span>
                <strong>{availablePct}%</strong>
              </div>
              <div className="progress"><span style={{ width: `${availablePct}%` }} className="progress-green" /></div>
            </div>

            <div className="insight">
              <div className="insight-row">
                <span>Enquiries resolved</span>
                <strong>{resolvedPct}%</strong>
              </div>
              <div className="progress"><span style={{ width: `${resolvedPct}%` }} className="progress-blue" /></div>
            </div>

            <div className="insight-list">
              <Link to="/admin/products" className="insight-link">
                <AdminIcon name="products" size={16} />Manage products
              </Link>
              <Link to="/admin/settings" className="insight-link">
                <AdminIcon name="settings" size={16} />Settings
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
