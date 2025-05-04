import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import Loader from './loader';

// This component protects routes that should only be accessible by PI and employee users
const PiEmployeeRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'PI' && user?.role !== 'employee' && user?.role !== 'admin') {
    // Redirect to dashboard if not admin, PI or employee
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

PiEmployeeRoute.propTypes = {
  children: PropTypes.element.isRequired
};

export default PiEmployeeRoute;