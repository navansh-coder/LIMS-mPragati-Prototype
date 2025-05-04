import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/verifyotp";
import SampleRequest from "./pages/SampleRequest";
import SampleRequestDetails from "./pages/SampleRequestDetails";
import Logout from "./pages/logout";
import AuthRedirect from "./components/authRedirect";
import ProtectedRoute from "./components/protectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminRoute from "./components/adminroute";
import PiEmployeeRoute from "./components/PiEmployeeRoute";
import Testing from "./pages/testing";
import ResetPassword from "./pages/ResetPassword";
import ReportDetail from "./pages/ReportDetail";
import CreateReport from "./pages/CreateReport";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/testing" element={<Testing />}></Route>
            <Route
              path="/"
              element={
                <AuthRedirect>
                  <Login />
                </AuthRedirect>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/register"
              element={
                <AuthRedirect>
                  <Register />
                </AuthRedirect>
              }
            />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sample-request"
              element={
                <ProtectedRoute>
                  <SampleRequest />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/sample-request/:id" 
              element={
                <ProtectedRoute>
                  <SampleRequestDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Report-related routes */}
            <Route 
              path="/reports/create" 
              element={
                <PiEmployeeRoute>
                  <CreateReport />
                </PiEmployeeRoute>
              } 
            />
            <Route 
              path="/reports/:id" 
              element={
                <ProtectedRoute>
                  <ReportDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
