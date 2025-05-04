import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/loader";
import ReportsList from "../components/ReportList";
import ReportDetail from "../pages/ReportDetail";

interface SampleRequest {
  _id: string;
  requestId: string;
  sampleType: string;
  characterizationType: string[];
  numberOfSamples: number;
  status: "Submitted" | "In-Review" | "Approved" | "Rejected" | "In-Progress" | "Completed";
  createdAt: string;
}

const UserDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"profile" | "requests" | "reports">("profile");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Requests state
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (activeTab === "requests") {
      fetchUserRequests();
    }
  }, [activeTab, token]);
  
  // Fetch all sample requests for the current user
  const fetchUserRequests = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const response = await axios.get("http://localhost:5000/api/requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequests(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch your requests");
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on status
  const filteredRequests = statusFilter 
    ? requests.filter(request => request.status === statusFilter)
    : requests;

  // Handle tab change
  const handleTabChange = (tab: "profile" | "requests" | "reports") => {
    setActiveTab(tab);
    setError("");
  };

  if (!user) {
    return <Loader fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-6 font-medium ${
              activeTab === "profile"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => handleTabChange("profile")}
          >
            My Profile
          </button>
          <button
            className={`py-2 px-6 font-medium ${
              activeTab === "requests"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => handleTabChange("requests")}
          >
            My Requests
          </button>
          <button
            className={`py-2 px-6 font-medium ${
              activeTab === "reports"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => handleTabChange("reports")}
          >
            My Reports
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">My Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Full Name</h3>
                  <p className="text-xl font-medium text-white">{user.userName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Email Address</h3>
                  <p className="text-xl font-medium text-white">{user.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Role</h3>
                  <div className="flex items-center">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full 
                      ${user.role === "admin" ? "bg-purple-900/30 text-purple-300" : ""}
                      ${user.role === "PI" ? "bg-yellow-900/30 text-yellow-300" : ""}
                      ${user.role === "employee" ? "bg-blue-900/30 text-blue-300" : ""}
                      ${user.role === "user" ? "bg-gray-700/30 text-gray-300" : ""}
                    `}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className={`ml-2 inline-flex px-3 py-1 text-sm rounded-full 
                      ${user.userType === "internal" ? "bg-blue-900/30 text-blue-300" : "bg-green-900/30 text-green-300"}
                    `}>
                      {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} User
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {user.orgName && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Organization</h3>
                    <p className="text-xl font-medium text-white">{user.orgName}</p>
                    {user.orgType && (
                      <p className="text-sm text-gray-400">{user.orgType}</p>
                    )}
                  </div>
                )}
                
                {user.contactNumber && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Contact Number</h3>
                    <p className="text-xl font-medium text-white">{user.contactNumber}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button 
                onClick={() => navigate("/sample-request")}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
              >
                Create New Sample Request
              </button>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Requests</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In-Review">In-Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                onClick={() => navigate("/sample-request")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
              >
                New Request
              </button>
            </div>

            {isLoading ? (
              <div className="py-20">
                <Loader />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                {filteredRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-750">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Request ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sample Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                              {request.requestId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {request.sampleType}
                              <span className="ml-2 text-xs text-gray-400">
                                ({request.numberOfSamples} {request.numberOfSamples === 1 ? 'sample' : 'samples'})
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full 
                                ${request.status === "Submitted" ? "bg-blue-900/30 text-blue-300" : ""}
                                ${request.status === "In-Review" ? "bg-yellow-900/30 text-yellow-300" : ""}
                                ${request.status === "Approved" ? "bg-green-900/30 text-green-300" : ""}
                                ${request.status === "Rejected" ? "bg-red-900/30 text-red-300" : ""}
                                ${request.status === "In-Progress" ? "bg-purple-900/30 text-purple-300" : ""}
                                ${request.status === "Completed" ? "bg-gray-700/30 text-gray-300" : ""}
                              `}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => navigate(`/sample-request/${request._id}`)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">
                      {requests.length === 0
                        ? "You haven't submitted any sample requests yet."
                        : "No requests match your filter criteria."}
                    </p>
                    <button
                      onClick={() => navigate("/sample-request")}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Your First Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <ReportsList 
              userOnly={true}
              onSelectReport={(report) => setSelectedReport(report._id)}
            />
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <ReportDetail
            reportId={selectedReport}
            onClose={() => setSelectedReport(null)}
            onStatusChange={() => {
              // Refresh the data when necessary
              if (activeTab === "requests") {
                fetchUserRequests();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;