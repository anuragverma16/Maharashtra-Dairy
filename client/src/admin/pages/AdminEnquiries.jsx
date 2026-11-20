import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminIcon from "../components/AdminIcon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { fetchAdminContacts, updateContact, deleteContact } from "../services/adminApi.js";

const resolvedFilter = { all: undefined, pending: false, resolved: true };

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wait for typing to pause before querying the server
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminContacts({ search, resolved: resolvedFilter[filter] })
      .then((data) => {
        if (!cancelled) {
          setEnquiries(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, filter]);

  const patchLocal = (id, changes) =>
    setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, ...changes } : e)));

  const toggle = async (enquiry, field) => {
    try {
      setError(null);
      await updateContact(enquiry._id, { [field]: !enquiry[field] });
      patchLocal(enquiry._id, { [field]: !enquiry[field] });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}? This cannot be undone.`)) return;
    try {
      setError(null);
      await deleteContact(enquiry._id);
      setEnquiries((prev) => prev.filter((e) => e._id !== enquiry._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-enquiries">
        <div className="page-header">
          <h1>Contact Enquiries</h1>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="filters">
          <input
            type="search"
            placeholder="Search by name, email or message..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-search"
            aria-label="Search enquiries"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-select" aria-label="Filter enquiries">
            <option value="all">All Enquiries</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading enquiries...</p>
          </div>
        ) : enquiries.length > 0 ? (
          <div className="enquiries-grid">
            {enquiries.map((enquiry) => (
              <article key={enquiry._id} className={`enquiry-card ${enquiry.isRead ? "" : "unread"}`}>
                <div className="enquiry-header">
                  <h3>{enquiry.name}</h3>
                  <span className={`badge ${enquiry.isResolved ? "resolved" : "pending"}`}>
                    <AdminIcon name={enquiry.isResolved ? "available" : "pending"} size={13} />
                    {enquiry.isResolved ? " Resolved" : " Pending"}
                  </span>
                </div>

                <p className="enquiry-email">
                  <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                </p>
                {enquiry.phone && (
                  <p className="enquiry-phone">
                    <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`}>{enquiry.phone}</a>
                  </p>
                )}
                {enquiry.subject && <p className="enquiry-subject">{enquiry.subject}</p>}

                <p className="enquiry-message">{enquiry.message}</p>

                <p className="enquiry-date">{new Date(enquiry.createdAt).toLocaleString()}</p>

                <div className="enquiry-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${enquiry.isRead ? "btn-secondary" : "btn-primary"}`}
                    onClick={() => toggle(enquiry, "isRead")}
                  >
                    {enquiry.isRead ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${enquiry.isResolved ? "btn-secondary" : "btn-success"}`}
                    onClick={() => toggle(enquiry, "isResolved")}
                  >
                    {enquiry.isResolved ? "Mark Pending" : "Mark Resolved"}
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(enquiry)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No enquiries found</p>
        )}
      </div>
    </AdminLayout>
  );
}
