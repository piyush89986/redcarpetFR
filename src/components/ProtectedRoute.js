import { Navigate, Outlet } from "react-router-dom";

// allowedRoles: array of roles allowed, e.g. ["superadmin"] or ["superadmin","admin"]
// If no allowedRoles passed, just check for token (any logged-in user)
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  const cleanRole = (role || "").toLowerCase().trim();

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!normalizedAllowed.includes(cleanRole)) {
      // Wrong role — redirect to their specific workspace
      const shopId = localStorage.getItem("shopId");
      if (cleanRole === "superadmin") {
        return <Navigate to="/ownerdashboard" replace />;
      }
      if (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") {
        return <Navigate to={`/${shopId}/counter`} replace />;
      }
      if (cleanRole === "admin" && shopId) {
        return <Navigate to={`/branddashboard2/${shopId}`} replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
