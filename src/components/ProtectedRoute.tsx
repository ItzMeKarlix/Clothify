import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, userService } from '../api/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'employee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 ProtectedRoute: Checking auth for role:', requiredRole);
        const session = await authService.getCurrentSession();
        console.log('🔐 ProtectedRoute: Session:', session);
        
        if (!session || !session.user?.id) {
          console.log('🔐 ProtectedRoute: No session or user ID, not authorized');
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // Fetch role directly from user_roles
        const role = await userService.getUserRole(session.user.id);
        console.log('🔐 ProtectedRoute: User role:', role, 'Required role:', requiredRole);
        
        if (!role || role !== requiredRole) {
          console.log('🔐 ProtectedRoute: Role mismatch or no role, not authorized');
          setAuthorized(false);
          setLoading(false);
          return;
        }

        console.log('🔐 ProtectedRoute: Authorized!');
        setAuthorized(true);
      } catch (err) {
        console.error("🔐 ProtectedRoute: Auth error:", err);
        // On any error, deny access
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Always redirect if not explicitly authorized
  if (!authorized) {
    console.log('🔐 ProtectedRoute: Not authorized, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔐 ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;