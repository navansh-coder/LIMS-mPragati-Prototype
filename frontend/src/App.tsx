import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/verifyotp';
import Dashboard from './pages/Dashboard';
import SampleRequest from './pages/SampleRequest';
import Logout from './pages/logout';
import AuthRedirect from './components/authRedirect';
import ProtectedRoute from './components/protectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - redirect to dashboard if logged in */}
          <Route path="/" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register" element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          } />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/sample-request" element={
            <ProtectedRoute>
              <SampleRequest />
            </ProtectedRoute>
          } />
          <Route path="/logout" element={<Logout />} />         
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;