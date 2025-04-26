import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    // Optional: Render a loading indicator while checking session
    return <div>Loading...</div>; 
  }

  if (!session) {
    // User not logged in, redirect to login page
    return <Navigate to="/auth" replace />; 
  }

  // User is logged in, render the requested component
  return <>{children}</>; 
};

export default ProtectedRoute;
