import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FormData {
  orgName: string;
  userName: string;
  orgType: "" | "Company" | "Startup" | "Institution" | "Individual";
  authSignatory: string;
  email: string;
  contactNumber: string;
  password: string;
}

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    orgName: "",
    userName: "",
    orgType: "", 
    authSignatory: "",
    email: "",
    contactNumber: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const orgTypes = ["Company", "Startup", "Institution", "Individual"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await register(formData);
      if (response.success) {
        setSuccess("Registration successful! Please verify your email.");
        setTimeout(
          () => navigate("/verify-otp", { state: { email: formData.email } }),
          1000
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setError(errorMessage || "Registration failed.");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Register Your Organization
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="orgName">
                Organization Name
              </label>
              <input
                id="orgName"
                name="orgName"
                type="text"
                value={formData.orgName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="orgType">
                Organization Type
              </label>
              <select
                id="orgType"
                name="orgType"
                value={formData.orgType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Organization Type</option>
                {orgTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="userName">
                Full Name
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="authSignatory">
                Authorized Signatory
              </label>
              <input
                id="authSignatory"
                name="authSignatory"
                type="text"
                value={formData.authSignatory}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="contactNumber">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-gray-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={8}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Already have an account?{" "}
              <span className="font-medium text-purple-400">Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;