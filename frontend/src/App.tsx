import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Signin from "./pages/Login";
import Register  from "./pages/Register";
import VerifyOTP from "./pages/verifyotp";
import Dashboard from "./pages/Dashboard";
import SampleRequest from "./pages/SampleRequest";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Signin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/sample-request" element={<SampleRequest />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;