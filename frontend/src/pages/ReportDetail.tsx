import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loader from "../components/loader";

interface Report {
  _id: string;
  reportId: string;
  requestId: string;
  sampleRequestId: {
    _id: string;
    requestId: string;
    sampleType: string;
    numberOfSamples: number;
    userId: {
      userName: string;
      email: string;
      orgName: string;
    }
  };
  title: string;
  description: string;
  testResults: Array<{
    testName: string;
    value: string;
    unit: string;
  }>;
  observations: string;
  conclusions: string;
  attachments: string[];
  status: "Draft" | "Pending" | "Verified" | "Approved" | "Published";
  generatedBy: {
    _id: string;
    userName: string;
    role: string;
  };
  verifiedBy?: {
    _id: string;
    userName: string;
    role: string;
  };
  approvedBy?: {
    _id: string;
    userName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReportDetailProps {
  reportId: string;
  onClose: () => void;
  onStatusChange?: () => void;
}

const ReportDetail = ({ reportId, onClose, onStatusChange }: ReportDetailProps) => {
  const { user, token } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchReport();
  }, [reportId, token]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!report) return;
    try {
      setStatusUpdateLoading(true);
      await axios.patch(
        `http://localhost:5000/api/reports/${report._id}/verify`, 
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      fetchReport();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to verify report");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    try {
      setStatusUpdateLoading(true);
      await axios.patch(
        `http://localhost:5000/api/reports/${report._id}/approve`, 
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      fetchReport();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to approve report");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!report) return;
    try {
      setStatusUpdateLoading(true);
      await axios.patch(
        `http://localhost:5000/api/reports/${report._id}/publish`,
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      fetchReport();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to publish report");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const canVerify = () => {
    if (!user || !report) return false;
    return (user.role === "employee" || user.role === "PI") && 
           report.status === "Pending" && 
           report.generatedBy._id !== user.id;
  };

  const canApprove = () => {
    if (!user || !report) return false;
    return user.role === "admin" && report.status === "Verified";
  };

  const canPublish = () => {
    if (!user || !report) return false;
    return user.role === "admin" && report.status === "Approved";
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 border border-gray-700 my-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
            <p>{error}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        ) : report ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {report.title} 
                <span className="ml-2 text-sm text-gray-400">({report.reportId})</span>
              </h2>
              <span 
                className={`inline-flex px-3 py-1 text-sm rounded-full
                  ${report.status === "Draft" ? "bg-gray-700/30 text-gray-300" : ""}
                  ${report.status === "Pending" ? "bg-yellow-900/30 text-yellow-300" : ""}
                  ${report.status === "Verified" ? "bg-blue-900/30 text-blue-300" : ""}
                  ${report.status === "Approved" ? "bg-green-900/30 text-green-300" : ""}
                  ${report.status === "Published" ? "bg-purple-900/30 text-purple-300" : ""}
                `}
              >
                {report.status}
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Request Info */}
              <div className="bg-gray-750 p-4 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Sample Request Information</h3>
                <p className="text-white">
                  <span className="font-semibold">Request ID:</span>{" "}
                  {report.sampleRequestId.requestId}
                </p>
                <p className="text-white">
                  <span className="font-semibold">Sample Type:</span>{" "}
                  {report.sampleRequestId.sampleType}
                </p>
                <p className="text-white">
                  <span className="font-semibold">Number of Samples:</span>{" "}
                  {report.sampleRequestId.numberOfSamples}
                </p>
                <p className="text-white">
                  <span className="font-semibold">Requested By:</span>{" "}
                  {report.sampleRequestId.userId.userName} ({report.sampleRequestId.userId.orgName})
                </p>
              </div>

              {/* Report Description */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Report Description</h3>
                <div className="bg-gray-750 p-4 rounded-lg">
                  <p className="text-gray-200 whitespace-pre-line">{report.description}</p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Test Results</h3>
                <div className="bg-gray-750 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Test Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {report.testResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.testName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{result.value}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observations */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Observations</h3>
                <div className="bg-gray-750 p-4 rounded-lg">
                  <p className="text-gray-200 whitespace-pre-line">{report.observations}</p>
                </div>
              </div>

              {/* Conclusions */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Conclusions</h3>
                <div className="bg-gray-750 p-4 rounded-lg">
                  <p className="text-gray-200 whitespace-pre-line">{report.conclusions}</p>
                </div>
              </div>

              {/* Verification & Approval Info */}
              <div className="bg-gray-750 p-4 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Report Workflow</h3>
                <div className="space-y-2">
                  <p className="text-white">
                    <span className="font-semibold">Generated By:</span>{" "}
                    {report.generatedBy.userName} ({report.generatedBy.role}) on{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                  
                  {report.verifiedBy && (
                    <p className="text-white">
                      <span className="font-semibold">Verified By:</span>{" "}
                      {report.verifiedBy.userName} ({report.verifiedBy.role})
                    </p>
                  )}
                  
                  {report.approvedBy && (
                    <p className="text-white">
                      <span className="font-semibold">Approved By:</span>{" "}
                      {report.approvedBy.userName} ({report.approvedBy.role})
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Status Changes */}
              {(canVerify() || canApprove() || canPublish()) && (
                <div className="border-t border-gray-700 pt-4">
                  {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      rows={3}
                      placeholder="Enter your remarks (optional)"
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-4">
                    {canVerify() && (
                      <button
                        onClick={handleVerify}
                        disabled={statusUpdateLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {statusUpdateLoading ? "Verifying..." : "Verify Report"}
                      </button>
                    )}
                    
                    {canApprove() && (
                      <button
                        onClick={handleApprove}
                        disabled={statusUpdateLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {statusUpdateLoading ? "Approving..." : "Approve Report"}
                      </button>
                    )}
                    
                    {canPublish() && (
                      <button
                        onClick={handlePublish}
                        disabled={statusUpdateLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {statusUpdateLoading ? "Publishing..." : "Publish Report"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {report.attachments && report.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Attachments</h3>
                  <div className="bg-gray-750 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {report.attachments.map((attachment, idx) => (
                        <li key={idx}>
                          <a 
                            href={`http://localhost:5000/uploads/${attachment}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Attachment {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-lg">
            <p>Report not found</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;