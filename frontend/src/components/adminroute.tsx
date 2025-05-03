import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import Loader  from './loader';
import React, { useState, useEffect } from 'react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); 
    
    return () => clearTimeout(timer);
  }, []);
  

  if (isLoading) {
    return <Loader />; 
  }
  

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  

  if (user?.role !== 'admin') {
    return <Navigate to="/sample-request" replace />;
  }

  return <>{children}</>;
};

AdminRoute.propTypes = {
  children: PropTypes.element.isRequired
};

export default AdminRoute;