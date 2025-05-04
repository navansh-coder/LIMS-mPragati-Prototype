import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Loader from "./loader";

interface SampleRequest {
  _id: string;
  requestId: string;
  sampleType: string;
  status: string;
  userId: {
    _id: string;
    userName: string;
  };
}

interface TestResult {
  testName: string;
  value: string;
  unit: string;
}

interface CreateReportFormProps {
  onClose: () => void;
  onReportCreated: (reportId?: string) => void;
  requestId?: string; 
}

const CreateReportForm = ({ onClose, onReportCreated, requestId }: CreateReportFormProps) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form data
  const [selectedRequestId, setSelectedRequestId] = useState(requestId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [observations, setObservations] = useState("");
  const [conclusions, setConclusions] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([
    { testName: "", value: "", unit: "" }
  ]);
  const [files, setFiles] = useState<FileList | null>(null);
  
  // Sample requests for dropdown
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  
  useEffect(() => {
    fetchSampleRequests();
  }, [token]);
  
  useEffect(() => {
    // Auto-generate title if request is selected
    if (selectedRequestId) {
      const selected = sampleRequests.find(req => req._id === selectedRequestId);
      if (selected) {
        setTitle(`Test Report for ${selected.sampleType} - ${selected.requestId}`);
      }
    }
  }, [selectedRequestId, sampleRequests]);

  const fetchSampleRequests = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Only fetch completed sample requests that don't already have reports
      const response = await axios.get("http://localhost:5000/api/reports/eligible-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSampleRequests(response.data.data);
      
      // Pre-select if requestId was provided
      if (requestId && response.data.data.some((req: SampleRequest) => req._id === requestId)) {
        setSelectedRequestId(requestId);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load sample requests");
    } finally {
      setLoading(false);
    }
  };

  const handleTestResultChange = (index: number, field: keyof TestResult, value: string) => {
    const newTestResults = [...testResults];
    newTestResults[index][field] = value;
    setTestResults(newTestResults);
  };

  const addTestResult = () => {
    setTestResults([...testResults, { testName: "", value: "", unit: "" }]);
  };

  const removeTestResult = (index: number) => {
    if (testResults.length > 1) {
      const newTestResults = [...testResults];
      newTestResults.splice(index, 1);
      setTestResults(newTestResults);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedRequestId) {
      setError("Please select a sample request");
      return;
    }
    
    if (!title) {
      setError("Please enter a report title");
      return;
    }
    
    // Validate test results
    const invalidTestResults = testResults.some(
      result => !result.testName || !result.value
    );
    
    if (invalidTestResults) {
      setError("Please fill in all test result fields");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("sampleRequestId", selectedRequestId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("observations", observations);
      formData.append("conclusions", conclusions);
      formData.append("testResults", JSON.stringify(testResults));
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("attachments", files[i]);
        }
      }
      
      await axios.post("http://localhost:5000/api/reports", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      setSuccess("Report created successfully!");
      
      // Notify parent component
      onReportCreated();
      
      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create report");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 border border-gray-700">
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 border border-gray-700 my-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Report</h2>
        
        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded-lg">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sample Request Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sample Request *
            </label>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              required
              disabled={submitting || !!requestId}
            >
              <option value="">-- Select Sample Request --</option>
              {sampleRequests.map((request) => (
                <option key={request._id} value={request._id}>
                  {request.requestId} ({request.sampleType}) - {request.userId.userName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Report Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              placeholder="Enter report title"
              required
              disabled={submitting}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              rows={3}
              placeholder="Enter report description"
              disabled={submitting}
            ></textarea>
          </div>
          
          {/* Test Results */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Test Results *
              </label>
              <button
                type="button"
                onClick={addTestResult}
                className="text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                disabled={submitting}
              >
                + Add Result
              </button>
            </div>
            
            {testResults.map((result, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-750 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-white">Result {index + 1}</h4>
                  {testResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestResult(index)}
                      className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Test Name</label>
                    <input
                      type="text"
                      value={result.testName}
                      onChange={(e) => handleTestResultChange(index, "testName", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                      placeholder="e.g., Hardness Test"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={result.value}
                      onChange={(e) => handleTestResultChange(index, "value", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                      placeholder="e.g., 42.5"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Unit</label>
                    <input
                      type="text"
                      value={result.unit}
                      onChange={(e) => handleTestResultChange(index, "unit", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm"
                      placeholder="e.g., HRC"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Observations
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              rows={3}
              placeholder="Enter observations"
              disabled={submitting}
            ></textarea>
          </div>
          
          {/* Conclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Conclusions
            </label>
            <textarea
              value={conclusions}
              onChange={(e) => setConclusions(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              rows={3}
              placeholder="Enter conclusions"
              disabled={submitting}
            ></textarea>
          </div>
          
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Attachments
            </label>
            <input
              type="file"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              multiple
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-400">
              You can upload multiple files (reports, images, etc.)
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="pt-4 border-t border-gray-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportForm;