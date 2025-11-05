import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập các route con
  return <Outlet />;
};

export default ProtectedRoute;