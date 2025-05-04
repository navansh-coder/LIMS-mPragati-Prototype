import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mPragati_Logo_V6.png'; 

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  // Determine home route based on user role
  const getHomeRoute = () => {
    if (!isAuthenticated) return '/';
    return user?.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <nav className="bg-[#051124]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to={getHomeRoute()} className="flex items-center">
              <img
                className="h-14 w-auto"
                src={logo}
                alt="mPragati Logo"
              />
              <div className="ml-3 text-white">
                <div className="text-xl font-medium">mPragati</div>
                <div className="text-sm opacity-80">IIT Delhi and ICMR-DHR</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {isAuthenticated && (
                <>
                  <Link 
                    to="/sample-request" 
                    className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                      isActive('/sample-request') ? 'border-b-2 border-blue-400' : ''
                    }`}
                  >
                    Sample Request
                  </Link>
                  
                  {(user?.role === 'PI' || user?.role === 'employee' || user?.role === 'admin') && (
                    <Link 
                      to="/reports" 
                      className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                        isActive('/reports') ? 'border-b-2 border-blue-400' : ''
                      }`}
                    >
                      Reports
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                        isActive('/admin') ? 'border-b-2 border-blue-400' : ''
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <Link 
                    to="/dashboard" 
                    className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                      isActive('/dashboard') ? 'border-b-2 border-blue-400' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <button 
                    onClick={() => logout()} 
                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/" 
                    className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                      isActive('/') ? 'border-b-2 border-blue-400' : ''
                    }`}
                  >
                    Login
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className={`text-white hover:text-blue-200 px-2 py-1 text-sm font-medium ${
                      isActive('/register') ? 'border-b-2 border-blue-400' : ''
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-200 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#051124] border-t border-opacity-20 border-gray-600">
            {isAuthenticated && (
              <>
                <Link
                  to="/sample-request"
                  className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/sample-request') ? 'bg-[#081c37]' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sample Request
                </Link>
                
                {(user?.role === 'PI' || user?.role === 'employee' || user?.role === 'admin') && (
                  <Link
                    to="/reports"
                    className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/reports') ? 'bg-[#081c37]' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Reports
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/admin') ? 'bg-[#081c37]' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <Link
                  to="/dashboard"
                  className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') ? 'bg-[#081c37]' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }} 
                  className="text-white bg-red-600 hover:bg-red-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') ? 'bg-[#081c37]' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                
                <Link
                  to="/register"
                  className={`text-white hover:bg-[#081c37] block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/register') ? 'bg-[#081c37]' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;