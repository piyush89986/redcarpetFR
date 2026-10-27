import React from "react";
import { Navigate, Outlet, useParams, useLocation } from "react-router-dom";

// Helper to safely check JWT token expiration
const isTokenExpired = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload && payload.exp) {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch (e) {
    return false;
  }
};

// allowedRoles: array of roles allowed, e.g. ["superadmin"] or ["superadmin","admin"]
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const shopId = localStorage.getItem("shopId");
  const { id } = useParams();
  const location = useLocation();

  // 1. Authentication Check
  if (!token || !role || isTokenExpired(token)) {
    if (token && isTokenExpired(token)) {
      console.warn("Session expired. Clearing credentials.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("shopId");
      localStorage.removeItem("user");
    }
    return <Navigate to="/" replace />;
  }

  const cleanRole = (role || "").toLowerCase().trim();

  // 2. Role-Based Access Control (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!normalizedAllowed.includes(cleanRole)) {
      // Wrong role — redirect to their specific workspace
      if (cleanRole === "superadmin") {
        return <Navigate to="/ownerdashboard" replace />;
      }
      if (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") {
        return <Navigate to={shopId ? `/${shopId}/counter` : "/"} replace />;
      }
      if (cleanRole === "admin" && shopId) {
        return <Navigate to={`/branddashboard2/${shopId}`} replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // 3. Scoped Tenant Security (Prevent URL Tampering / Cross-Tenant Access)
  if (id && shopId) {
    // Mall Admin cannot access another mall's dashboard or store setup
    if (cleanRole === "admin") {
      const isMallRoute =
        location.pathname.startsWith("/branddashboard2/") ||
        location.pathname.startsWith("/shop/");
      if (isMallRoute && id !== shopId) {
        console.warn(`[Security Guard] Blocked mall admin access to unauthorized mall ID: ${id}`);
        return <Navigate to={`/branddashboard2/${shopId}`} replace />;
      }
    }

    // Shop Admin cannot access another store's live counter or display editor
    if (
      (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") &&
      id !== shopId
    ) {
      console.warn(`[Security Guard] Blocked store admin access to unauthorized counter ID: ${id}`);
      return <Navigate to={`/${shopId}/counter`} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
