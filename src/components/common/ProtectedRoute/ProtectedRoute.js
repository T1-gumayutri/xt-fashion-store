import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom"; 

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    ); 
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;