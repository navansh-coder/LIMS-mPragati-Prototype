import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  userName: string;
  email: string;
  orgName?: string;
  orgType?: string;
  contactNumber?: string;
  authSignatory?: string;
  role: string; 
  userType: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  // user_role: string | null; 
  register: (formData: RegisterData) => Promise<{ message: string; success: boolean }>;
  verifyOTP: (email: string, otp: string) => Promise<{ token: string; user: User }>;
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  userName: string;
  email: string;
  password: string;
  orgName?: string;
  orgType?: string;
  contactNumber?: string;
  authSignatory?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/auth/me');
      setUser(response.data.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('token', token || '');
      if(user) {
        localStorage.setItem('isAuthenticated', 'true');
      }
      else {
        localStorage.setItem('isAuthenticated', 'false');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const register = async (formData: RegisterData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/register', formData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/verify-otp', { email, otp });
      const newToken = response.data.token;
      const userData = response.data.data.user;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', { email, password });
      const newToken = response.data.token;
      const userData = response.data.data.user;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    register,
    user_role: user ? user.role : null,
    verifyOTP,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};