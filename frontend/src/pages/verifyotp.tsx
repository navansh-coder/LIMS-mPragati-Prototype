import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const VerifyOTP = () => {
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  if (!email) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyOTP(email, otp);
      setSuccess("OTP verified successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        setError(errorMessage || "OTP verification failed.");
      } else {
        setError("OTP verification failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:5000/api/v1/auth/resend-otp", {
        email,
      });
      setSuccess(response.data.message);
      setOtp(""); // Clear the OTP input
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;
        setError(errorMessage || "Failed to resend OTP.");
      } else {
        setError("Failed to resend OTP.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Verify OTP
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Enter OTP sent to {email}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter OTP"
                required
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="mailto:support@mpragati.com"
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Having trouble? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;