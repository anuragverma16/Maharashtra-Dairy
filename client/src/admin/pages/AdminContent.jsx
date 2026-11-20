import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { fetchSiteContent, updateContent } from "../services/adminApi.js";

const SECTIONS = [
  { id: "home", label: "Home Page" },
  { id: "about", label: "About Us" },
  { id: "quality", label: "Quality & Hygiene" },
  { id: "contact", label: "Contact Information" },
];

export default function AdminContent() {
  const [contents, setContents] = useState({}); // { [section]: text }
  const [updatedAt, setUpdatedAt] = useState({}); // { [section]: Date string }
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent()
      .then((items) => {
        if (cancelled) return;
        const text = {};
        const dates = {};
        items.forEach((item) => {
          text[item.section] = item.content || "";
          dates[item.section] = item.updatedAt;
        });
        setContents(text);
        setUpdatedAt(dates);
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
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSave = async (section) => {
    try {
      setSavingSection(section);
      setError(null);
      const saved = await updateContent(section, contents[section] || "");
      setUpdatedAt((prev) => ({ ...prev, [section]: saved?.updatedAt || new Date().toISOString() }));
      setSuccess(`${SECTIONS.find((s) => s.id === section)?.label} saved.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="page-header">
          <h1>Website Content</h1>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="content-sections">
          <div className="section-tabs" role="tablist">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={activeSection === section.id}
                className={`tab ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="section-content">
            {SECTIONS.map((section) => (
              <div key={section.id} className={`content-editor ${activeSection === section.id ? "active" : ""}`} hidden={activeSection !== section.id}>
                <div className="editor-header">
                  <h2>{section.label}</h2>
                  <p className="text-muted">Notes and copy for this section. Saved to the database.</p>
                </div>

                <textarea
                  value={contents[section.id] || ""}
                  onChange={(e) => setContents((prev) => ({ ...prev, [section.id]: e.target.value }))}
                  rows="12"
                  className="content-textarea"
                  placeholder="Enter content here..."
                  aria-label={`${section.label} content`}
                />

                <div className="editor-footer">
                  <button type="button" className="btn btn-primary" onClick={() => handleSave(section.id)} disabled={savingSection !== null}>
                    {savingSection === section.id ? "Saving..." : "Save Changes"}
                  </button>
                  <p className="text-muted">
                    Last saved: {updatedAt[section.id] ? new Date(updatedAt[section.id]).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
