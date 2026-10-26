import { Navigate, Outlet } from "react-router-dom";

// allowedRoles: array of roles allowed, e.g. ["superadmin"] or ["superadmin","admin"]
// If no allowedRoles passed, just check for token (any logged-in user)
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Logged in but wrong role — redirect to their correct dashboard
    if (role === "admin") {
      const shopId = localStorage.getItem("shopId");
      return <Navigate to={`/branddashboard2/${shopId}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
