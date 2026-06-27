import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User role is not authorized for this route
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      alert("Access denied. This page is for canteen staff only.");
      return <Navigate to="/menu" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
