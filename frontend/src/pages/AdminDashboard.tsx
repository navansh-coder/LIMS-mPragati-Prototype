import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// User management tab types
interface User {
  _id: string;
  userName: string;
  email: string;
  orgName: string;
  orgType: string;
  contactNumber: string;
  role: "user" | "employee" | "PI" | "admin";
  userType: "internal" | "external";
  isVerified: boolean;
}

// Request management tab types
interface SampleRequest {
  _id: string;
  requestId: string;
  userId: string | User;
  orgId: string;
  orgName: string;
  sampleType: string;
  sampleDescription: string;
  characterizationType: string[];
  sampleImage?: string;
  numberOfSamples: number;
  icmrProject: {
    isFunded: boolean;
    projectNumber: string;
  };
  status: "Submitted" | "In-Review" | "Approved" | "Rejected" | "In-Progress" | "Completed";
  createdAt: string;
}

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  
  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userFilters, setUserFilters] = useState({
    userType: "",
    orgName: "",
    orgType: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"user" | "employee" | "PI" | "admin">("user");
  
  // Requests tab state
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SampleRequest[]>([]);
  const [requestFilters, setRequestFilters] = useState({
    status: "",
    orgName: "",
    orgType: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequestStatus, setNewRequestStatus] = useState<"Submitted" | "In-Review" | "Approved" | "Rejected" | "In-Progress" | "Completed">("Submitted");
  
  // Alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    if (!token) return;
    
    fetchUsers();
    fetchRequests();
  }, [token]);

  // Apply filters to users
  useEffect(() => {
    let result = [...users];
    
    if (userFilters.userType) {
      result = result.filter(user => user.userType === userFilters.userType);
    }
    
    if (userFilters.orgName) {
      result = result.filter(user => 
        user.orgName.toLowerCase().includes(userFilters.orgName.toLowerCase())
      );
    }
    
    if (userFilters.orgType) {
      result = result.filter(user => user.orgType === userFilters.orgType);
    }
    
    setFilteredUsers(result);
  }, [users, userFilters]);

  // Apply filters to requests
  useEffect(() => {
    let result = [...requests];
    
    if (requestFilters.status) {
      result = result.filter(request => request.status === requestFilters.status);
    }
    
    if (requestFilters.orgName) {
      result = result.filter(request => 
        typeof request.userId === 'object' && request.userId.orgName.toLowerCase().includes(requestFilters.orgName.toLowerCase())
      );
    }
    
    if (requestFilters.orgType) {
      result = result.filter(request => 
        typeof request.userId === 'object' && request.userId.orgType === requestFilters.orgType
      );
    }
    
    setFilteredRequests(result);
  }, [requests, requestFilters]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch users");
      if (err?.response?.status === 403) {
        // Not an admin, redirect
        navigate("/sample-request", { replace: true });
      }
    }
  };

  // Fetch all sample requests
  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/admin/sample-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
      setFilteredRequests(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch sample requests");
    }
  };

  // Handle user filter changes
  const handleUserFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle request filter changes
  const handleRequestFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestFilters(prev => ({ ...prev, [name]: value }));
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("User deleted successfully");
      setUsers(users.filter(user => user._id !== userId));
      setSelectedUser(null);
      setShowUserModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete user");
    }
  };

  // Update user role
  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/v1/admin/users/${selectedUser._id}/role`,
        { role: newUserRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("User role updated successfully");
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return { ...user, role: newUserRole };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setShowUserModal(false);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update user role");
    }
  };

  // Update sample request status
  const handleUpdateRequestStatus = async () => {
    if (!selectedRequest) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${selectedRequest._id}/status`,
        { status: newRequestStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Request status updated successfully");
      
      // Update local state
      const updatedRequests = requests.map(request => {
        if (request._id === selectedRequest._id) {
          return { ...request, status: newRequestStatus };
        }
        return request;
      });
      
      setRequests(updatedRequests);
      setShowRequestModal(false);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update request status");
    }
  };

  // Open user modal for editing
  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setNewUserRole(user.role);
    setShowUserModal(true);
  };

  // Open request modal for status change
  const openRequestModal = (request: SampleRequest) => {
    setSelectedRequest(request);
    setNewRequestStatus(request.status);
    setShowRequestModal(true);
  };

  // Clear alerts when changing tabs
  const handleTabChange = (tab: "users" | "requests") => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        {/* Alerts */}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-6 font-medium ${
              activeTab === "users"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => handleTabChange("users")}
          >
            User Management
          </button>
          <button
            className={`py-2 px-6 font-medium ${
              activeTab === "requests"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => handleTabChange("requests")}
          >
            Sample Requests
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User Type</label>
                <select
                  name="userType"
                  value={userFilters.userType}
                  onChange={handleUserFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Types</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="orgName"
                  value={userFilters.orgName}
                  onChange={handleUserFilterChange}
                  placeholder="Filter by organization"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Organization Type</label>
                <select
                  name="orgType"
                  value={userFilters.orgType}
                  onChange={handleUserFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Types</option>
                  <option value="Company">Company</option>
                  <option value="Startup">Startup</option>
                  <option value="Institution">Institution</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {user.orgName} <span className="text-xs text-gray-400">({user.orgType})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            user.userType === "internal" 
                              ? "bg-blue-900/30 text-blue-300" 
                              : "bg-green-900/30 text-green-300"
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full 
                            ${user.role === "admin" ? "bg-purple-900/30 text-purple-300" : ""}
                            ${user.role === "PI" ? "bg-yellow-900/30 text-yellow-300" : ""}
                            ${user.role === "employee" ? "bg-blue-900/30 text-blue-300" : ""}
                            ${user.role === "user" ? "bg-gray-700/30 text-gray-300" : ""}
                          `}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openUserModal(user)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="ml-4 text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                        No users found matching the filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sample Requests Tab */}
        {activeTab === "requests" && (
          <div>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={requestFilters.status}
                  onChange={handleRequestFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In-Review">In-Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="orgName"
                  value={requestFilters.orgName}
                  onChange={handleRequestFilterChange}
                  placeholder="Filter by organization"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Organization Type</label>
                <select
                  name="orgType"
                  value={requestFilters.orgType}
                  onChange={handleRequestFilterChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Types</option>
                  <option value="Company">Company</option>
                  <option value="Startup">Startup</option>
                  <option value="Institution">Institution</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sample Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                          {request.requestId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {request.sampleType} <span className="text-xs text-gray-400">({request.numberOfSamples})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {typeof request.userId === 'object' ? request.userId.orgName : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
                            onClick={() => openRequestModal(request)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Change Status
                          </button>
                          <button
                            onClick={() => navigate(`/sample-request/${request._id}`)}
                            className="ml-4 text-blue-400 hover:text-blue-300"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                        No requests found matching the filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Edit User: {selectedUser.userName}</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Email: {selectedUser.email}</p>
                <p className="text-sm text-gray-400">Organization: {selectedUser.orgName}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "user" | "employee" | "PI" | "admin")}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="user">User</option>
                  <option value="employee">Employee</option>
                  <option value="PI">PI</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Delete User
                  </button>
                  <button
                    onClick={handleUpdateUserRole}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Status Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Update Request Status: {selectedRequest.requestId}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Sample Type: {selectedRequest.sampleType}</p>
                <p className="text-sm text-gray-400">
                  Organization: {typeof selectedRequest.userId === 'object' ? selectedRequest.userId.orgName : 'Unknown'}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={newRequestStatus}
                  onChange={(e) => setNewRequestStatus(e.target.value as "Submitted" | "In-Review" | "Approved" | "Rejected" | "In-Progress" | "Completed")}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In-Review">In-Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRequestStatus}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;