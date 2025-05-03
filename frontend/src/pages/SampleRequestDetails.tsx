import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loader from "../components/loader";
import sampleIMAGE from "../../../public/uploads/1746183298939-lightning-mcqueen-in-pixar-style-1227243308603146260.jpeg";

interface SampleRequest {
  _id: string;
  requestId: string;
  userId: {
    _id: string;
    userName: string;
    email: string;
    orgName: string;
    orgType: string;
    contactNumber: string;
  };
  sampleType: string;
  sampleDescription: string;
  characterizationType: string[];
  numberOfSamples: number;
  sampleImage?: string;
  status:
    | "Submitted"
    | "In-Review"
    | "Approved"
    | "Rejected"
    | "In-Progress"
    | "Completed";
  icmrProject: {
    isFunded: boolean;
    projectNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SampleRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SampleRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/requests/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRequest(response.data.data);
        console.log(request?.sampleImage);
        setNewStatus(response.data.data.status);
        setLoading(false);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load request details"
        );
        setLoading(false);
      }
    };

    if (token && id) {
      fetchRequestDetails();
    }
  }, [id, token]);

  const handleStatusChange = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state
      if (request) {
        setRequest({ ...request, status: newStatus as any });
      }

      // Show success notification
      alert("Status updated successfully");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-lg">
            <p>Request not found</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Sample Request Details
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
          {/* Request header with ID and status */}
          <div className="bg-gray-750 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {request.requestId}
              </h2>
              <p className="text-sm text-gray-400">
                Created: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm rounded-full 
              ${
                request.status === "Submitted"
                  ? "bg-blue-900/30 text-blue-300"
                  : ""
              }
              ${
                request.status === "In-Review"
                  ? "bg-yellow-900/30 text-yellow-300"
                  : ""
              }
              ${
                request.status === "Approved"
                  ? "bg-green-900/30 text-green-300"
                  : ""
              }
              ${
                request.status === "Rejected"
                  ? "bg-red-900/30 text-red-300"
                  : ""
              }
              ${
                request.status === "In-Progress"
                  ? "bg-purple-900/30 text-purple-300"
                  : ""
              }
              ${
                request.status === "Completed"
                  ? "bg-gray-700/30 text-gray-300"
                  : ""
              }
            `}
            >
              {request.status}
            </span>
          </div>

          {/* Request body - details */}
          <div className="p-6 space-y-6">
            {/* User details */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                Requester Information
              </h3>
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-white">
                  <span className="font-semibold">Name:</span>{" "}
                  {request.userId.userName}
                </p>
                <p className="text-white">
                  <span className="font-semibold">Email:</span>{" "}
                  {request.userId.email}
                </p>
                <p className="text-white">
                  <span className="font-semibold">Organization:</span>{" "}
                  {request.userId.orgName} ({request.userId.orgType})
                </p>
                {request.userId.contactNumber && (
                  <p className="text-white">
                    <span className="font-semibold">Contact:</span>{" "}
                    {request.userId.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Sample details */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                Sample Information
              </h3>
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-white">
                      <span className="font-semibold">Type:</span>{" "}
                      {request.sampleType}
                    </p>
                    <p className="text-white">
                      <span className="font-semibold">Number of Samples:</span>{" "}
                      {request.numberOfSamples}
                    </p>
                    <p className="text-white">
                      <span className="font-semibold">
                        Characterization Types:
                      </span>
                    </p>
                    <ul className="list-disc list-inside text-gray-300 ml-2">
                      {request.characterizationType.map((type, index) => (
                        <li key={index}>{type}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Sample image if available */}
                  {request.sampleImage && (
                    <div className="ml-4">
                      <img
                        src={sampleIMAGE}
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            request.sampleImage
                          );
                          e.currentTarget.src =
                            "https://via.placeholder.com/128?text=No+Image";
                        }}
                        alt="Sample image"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ICMR project details */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                ICMR Project Information
              </h3>
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-white">
                  <span className="font-semibold">ICMR Funded:</span>{" "}
                  {request.icmrProject.isFunded ? "Yes" : "No"}
                </p>
                {request.icmrProject.isFunded && (
                  <p className="text-white">
                    <span className="font-semibold">Project Number:</span>{" "}
                    {request.icmrProject.projectNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Sample description */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                Sample Description
              </h3>
              <div className="bg-gray-750 p-4 rounded-lg">
                <p className="text-gray-200 whitespace-pre-line">
                  {request.sampleDescription}
                </p>
              </div>
            </div>

            {/* Status update section for admins/PIs */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
                Update Status
              </h3>
              <div className="flex space-x-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In-Review">In-Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button
                  onClick={handleStatusChange}
                  disabled={newStatus === request.status}
                  className={`px-6 py-2 rounded-lg text-white ${
                    newStatus === request.status
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  }`}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleRequestDetails;
