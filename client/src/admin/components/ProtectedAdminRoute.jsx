import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, checking, sessionError, retrySession } = useAdminAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Checking your session...</p>
      </div>
    );
  }

  // Server unreachable: keep the admin signed in and offer a retry instead of sending them to login
  if (!isAuthenticated && sessionError) {
    return (
      <div className="admin-loading">
        <p>{sessionError}</p>
        <button type="button" className="btn btn-primary" onClick={retrySession}>Try again</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Remember where the admin was going so login can send them back
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
