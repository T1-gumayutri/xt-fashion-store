import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth(); 

  // ⏳ Trong khi AuthContext đang đọc localStorage, chưa biết có user hay không
  if (loading) {
    return null; 
  }

  // ❌ Nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Nếu route yêu cầu role cụ thể mà user không khớp
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // ✅ Nếu đã đăng nhập và role hợp lệ
  return <Outlet />;
};

export default ProtectedRoute;
