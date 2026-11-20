import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import AdminIcon from "../components/AdminIcon.jsx";

const FEATURES = [
  { icon: "products", text: "Manage dairy products and availability" },
  { icon: "enquiries", text: "Read and resolve customer enquiries" },
  { icon: "content", text: "Keep website content up to date" },
];

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { login, loading, error, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Already signed in: skip the form
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email.trim(), password);
    if (success) navigate(location.state?.from || "/admin/dashboard", { replace: true });
  };

  return (
    <div className="admin-login">
      <div className="login-background" aria-hidden="true">
        <div className="login-shapes shape-1" />
        <div className="login-shapes shape-2" />
        <div className="login-shapes shape-3" />
      </div>

      <div className="login-container">
        <aside className="login-brand">
          <div className="brand-logo">
            {!logoError ? (
              <img src="/logo.png" alt="Maharashtra Dairy logo" onError={() => setLogoError(true)} />
            ) : (
              <AdminIcon name="products" size={36} />
            )}
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Maharashtra Dairy</h1>
            <p className="brand-sub">Admin Dashboard</p>
            <p className="brand-tag">Pure · Fresh · Traditional</p>
          </div>
          <ul className="brand-points">
            {FEATURES.map((f) => (
              <li key={f.icon}>
                <AdminIcon name={f.icon} size={18} className="point-icon" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="login-box">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in with your admin credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="alert error" role="alert">
                <AdminIcon name="alert" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <AdminIcon name="email" size={16} className="label-icon" />
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@maharashtradairy.com"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <AdminIcon name="lock" size={16} className="label-icon" />
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <AdminIcon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-login" disabled={loading}>
              <span>{loading ? "Logging in..." : "Login to Dashboard"}</span>
              {loading ? <span className="spinner" /> : <AdminIcon name="arrow" size={18} />}
            </button>
          </form>

          <div className="login-footer">
            <p className="security-note">
              <AdminIcon name="lock" size={15} /> Secure admin access only
            </p>
            <p className="version-info">Admin Panel v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
