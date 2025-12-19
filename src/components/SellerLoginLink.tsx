import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, userService } from '../api/api';

const SellerLoginLink: React.FC = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const handleSellerLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      // Check if user is authenticated
      const session = await authService.getCurrentSession();

      if (session && session.user?.id) {
        // User is authenticated, check their role
        const role = await userService.getUserRole(session.user.id);

        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'employee') {
          navigate('/employee/dashboard');
        } else {
          // User has a session but no valid role, go to login
          navigate('/login');
        }
      } else {
        // User is not authenticated, go to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, default to login page
      navigate('/login');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <li>
      <button
        onClick={handleSellerLogin}
        disabled={isChecking}
        className="hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? 'Checking...' : 'Seller Login'}
      </button>
    </li>
  );
};

export default SellerLoginLink;