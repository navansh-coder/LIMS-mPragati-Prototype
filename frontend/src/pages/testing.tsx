import { useAuth } from '../context/AuthContext';
import React from 'react';

export default function Testing() {
  const { user,token, isAuthenticated, logout } = useAuth();
  const hello=localStorage.getItem('user');

  return (
    <div>
      <h1>Testing Page</h1>
      {/* <p>User: {user ? JSON.stringify(user) : 'Not logged in'}</p> */}
      <p>Token: {hello}</p>
      <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

