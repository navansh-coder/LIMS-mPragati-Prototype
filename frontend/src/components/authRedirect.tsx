import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AuthRedirectProps = {
  children: ReactElement;
};

// This component redirects authenticated users away from auth pages (login/register)
const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AuthRedirect;