import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loader from "./loader";

interface Report {
  _id: string;
  reportId: string;
  requestId: string;
  sampleRequestId: string;
  title: string;
  status: "Draft" | "Pending" | "Verified" | "Approved" | "Published";
  generatedBy: {
    _id: string;
    userName: string;
    role: string;
  };
  createdAt: string;
}

interface ReportsListProps {
  userOnly?: boolean;
  onSelectReport: (report: Report) => void;
}

const ReportsList = ({
  userOnly = false,
  onSelectReport,
}: ReportsListProps) => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchReports();
  }, [token, userOnly]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      // Use different endpoints for user view vs admin view
      const endpoint = userOnly
        ? "http://localhost:5000/api/reports/my-reports"
        : "http://localhost:5000/api/reports";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredReports = statusFilter
    ? reports.filter((report) => report.status === statusFilter)
    : reports;

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchReports}
          className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400">
          {userOnly ? "You don't have any reports yet." : "No reports found."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Reports</option>
          <option value="Draft">Draft</option>
          <option value="Pending">Pending Verification</option>
          <option value="Verified">Verified</option>
          <option value="Approved">Approved</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Report ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredReports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {report.reportId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {report.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full 
                    ${
                      report.status === "Draft"
                        ? "bg-gray-700/30 text-gray-300"
                        : ""
                    }
                    ${
                      report.status === "Pending"
                        ? "bg-yellow-900/30 text-yellow-300"
                        : ""
                    }
                    ${
                      report.status === "Verified"
                        ? "bg-blue-900/30 text-blue-300"
                        : ""
                    }
                    ${
                      report.status === "Approved"
                        ? "bg-green-900/30 text-green-300"
                        : ""
                    }
                    ${
                      report.status === "Published"
                        ? "bg-purple-900/30 text-purple-300"
                        : ""
                    }
                  `}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onSelectReport(report)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsList;
