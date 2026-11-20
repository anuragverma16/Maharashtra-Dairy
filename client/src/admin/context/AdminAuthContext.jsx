import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api.js";

// The session is an httpOnly cookie set by the server. The browser never stores or
// reads the session secret, so refreshing the page simply asks the server "who is signed in?".
const AdminAuthContext = createContext(null);

const RESTORE_ATTEMPTS = 3;
const RESTORE_DELAY_MS = 1500;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // `checking`: asking the server whether this browser has a live session
  const [checking, setChecking] = useState(true);
  // `sessionError`: the server could not be reached, so we don't know. Not the same as "signed out".
  const [sessionError, setSessionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clears the signed-in state in this tab only (session expired, or the user logged out)
  const clearSession = useCallback(() => {
    setAdmin(null);
    setSessionError(null);
  }, []);

  // Any 401 from an admin request (see lib/api.js) means the session ended on the server
  useEffect(() => {
    window.addEventListener("admin:unauthorized", clearSession);
    return () => window.removeEventListener("admin:unauthorized", clearSession);
  }, [clearSession]);

  // Asks the server for the current admin. A 401 means signed out; anything else (network
  // blip, server restarting) is retried, so a refresh does not sign the admin out.
  const restoreSession = useCallback(async (isCancelled = () => false) => {
    setChecking(true);
    for (let attempt = 1; attempt <= RESTORE_ATTEMPTS; attempt += 1) {
      try {
        const res = await apiRequest("/api/admin/auth/me");
        if (isCancelled()) return;
        setAdmin(res.admin);
        setSessionError(null);
        setChecking(false);
        return;
      } catch (err) {
        if (isCancelled()) return;
        if (err.status === 401) {
          clearSession();
          setChecking(false);
          return;
        }
        if (attempt < RESTORE_ATTEMPTS) await wait(RESTORE_DELAY_MS);
      }
    }
    if (!isCancelled()) {
      setSessionError("We could not reach the server to check your session.");
      setChecking(false);
    }
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;
    restoreSession(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [restoreSession]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/admin/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setAdmin(data.admin);
      setSessionError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ends the session on the server (removes it from the database) and in this tab
  const logout = useCallback(async () => {
    clearSession();
    try {
      await apiRequest("/api/admin/auth/logout", { method: "POST" });
    } catch {
      /* the local session is already cleared */
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      admin,
      checking,
      sessionError,
      loading,
      error,
      login,
      logout,
      retrySession: () => restoreSession(),
      isAuthenticated: Boolean(admin),
    }),
    [admin, checking, sessionError, loading, error, login, logout, restoreSession]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
