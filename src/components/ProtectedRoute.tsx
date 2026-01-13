import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, userService } from '../api/api';
import { logger } from '../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.log('🔐 ProtectedRoute: Checking auth for role:', requiredRole);
        const session = await authService.getCurrentSession();
        logger.log('🔐 ProtectedRoute: Session:', session);
        
        if (!session || !session.user?.id) {
          logger.log('🔐 ProtectedRoute: No session or user ID, not authorized');
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // If no specific role is required (like for settings during onboarding), just check session
        if (!requiredRole) {
          logger.log('🔐 ProtectedRoute: No role required, authorized by session only');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Fetch role directly from user_roles
        const role = await userService.getUserRole(session.user.id);
        logger.log('🔐 ProtectedRoute: User role:', role, 'Required role:', requiredRole);
        
        if (!role || role !== requiredRole) {
          logger.log('🔐 ProtectedRoute: Role mismatch or no role, not authorized');
          setAuthorized(false);
          setLoading(false);
          return;
        }

        logger.log('🔐 ProtectedRoute: Authorized!');
        setAuthorized(true);
      } catch (err) {
        logger.error("🔐 ProtectedRoute: Auth error:", err);
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
    logger.log('🔐 ProtectedRoute: Not authorized, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  logger.log('🔐 ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;