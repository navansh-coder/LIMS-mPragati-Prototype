import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface SampleRequest {
  _id: string;
  requestId: string;
  sampleType: string;
  numberOfSamples: number;
  characterizationType: string[];
  status: string;
}

interface TestResult {
  parameter: string;
  value: string;
  unit: string;
}

interface CreateReportFormProps {
  onReportCreated: () => void;
  onClose: () => void;
}

const CreateReportForm: React.FC<CreateReportFormProps> = ({ onReportCreated, onClose }) => {
  const { token } = useAuth();
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [templateUsed, setTemplateUsed] = useState<"Standard" | "Comprehensive" | "Basic">("Standard");
  
  // Fetch eligible sample requests (in-progress or completed)
  useEffect(() => {
    const fetchEligibleRequests = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get("/api/requests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter for in-progress or completed requests that don't have a report yet
        const eligibleRequests = response.data.data.filter(
          (req: SampleRequest) => 
            (req.status === "In-Progress" || req.status === "Completed")
        );
        
        setSampleRequests(eligibleRequests);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch eligible sample requests");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEligibleRequests();
  }, [token]);
  
  // Initialize test results based on selected request's characterization types
  useEffect(() => {
    if (selectedRequestId) {
      const selectedRequest = sampleRequests.find(req => req._id === selectedRequestId);
      if (selectedRequest) {
        // Generate default test parameters based on characterization types
        const newTestResults: TestResult[] = [];
        
        selectedRequest.characterizationType.forEach(type => {
          switch (type) {
            case "Tension-Static":
              newTestResults.push(
                { parameter: "Young's Modulus", value: "", unit: "GPa" },
                { parameter: "Ultimate Tensile Strength", value: "", unit: "MPa" },
                { parameter: "Yield Strength", value: "", unit: "MPa" },
                { parameter: "Elongation at Break", value: "", unit: "%" }
              );
              break;
            case "Compression-Static":
              newTestResults.push(
                { parameter: "Compressive Strength", value: "", unit: "MPa" },
                { parameter: "Compressive Modulus", value: "", unit: "GPa" }
              );
              break;
            case "Hardness":
              newTestResults.push(
                { parameter: "Hardness", value: "", unit: "HV" }
              );
              break;
            case "MicroHardness":
              newTestResults.push(
                { parameter: "Microhardness", value: "", unit: "HV" }
              );
              break;
            case "MicroCT":
              newTestResults.push(
                { parameter: "Porosity", value: "", unit: "%" },
                { parameter: "Defect Volume", value: "", unit: "mm³" }
              );
              break;
            case "SurfaceProfilometry":
              newTestResults.push(
                { parameter: "Surface Roughness (Ra)", value: "", unit: "μm" },
                { parameter: "Surface Roughness (Rz)", value: "", unit: "μm" }
              );
              break;
            // Add more cases as needed
            default:
              newTestResults.push(
                { parameter: `${type} Result`, value: "", unit: "" }
              );
          }
        });
        
        setTestResults(newTestResults);
      }
    } else {
      setTestResults([]);
    }
  }, [selectedRequestId, sampleRequests]);
  
  const handleAddTestResult = () => {
    setTestResults([...testResults, { parameter: "", value: "", unit: "" }]);
  };
  
  const handleRemoveTestResult = (index: number) => {
    const newResults = [...testResults];
    newResults.splice(index, 1);
    setTestResults(newResults);
  };
  
  const handleTestResultChange = (index: number, field: keyof TestResult, value: string) => {
    const newResults = [...testResults];
    newResults[index][field] = value;
    setTestResults(newResults);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      setError("Please select a sample request");
      return;
    }
    
    if (testResults.length === 0) {
      setError("Please add at least one test result");
      return;
    }
    
    // Validate that all test results have parameter, value, and unit
    const isValid = testResults.every(
      result => result.parameter.trim() !== "" && result.value.trim() !== "" && result.unit.trim() !== ""
    );
    
    if (!isValid) {
      setError("Please complete all test result fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      await axios.post(
        "/api/reports",
        {
          sampleRequestId: selectedRequestId,
          testResults,
          templateUsed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onReportCreated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl my-8 mx-4 border border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Report</h2>
            
            {error && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Sample Request Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Sample Request *
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                  disabled={loading || sampleRequests.length === 0}
                >
                  <option value="">-- Select Sample Request --</option>
                  {sampleRequests.map(request => (
                    <option key={request._id} value={request._id}>
                      {request.requestId} - {request.sampleType} ({request.numberOfSamples} samples)
                    </option>
                  ))}
                </select>
                {loading && (
                  <p className="mt-2 text-sm text-gray-400">Loading available requests...</p>
                )}
                {!loading && sampleRequests.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-400">
                    No eligible sample requests found. Only In-Progress or Completed requests can have reports.
                  </p>
                )}
              </div>
              
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Report Template *
                </label>
                <select
                  value={templateUsed}
                  onChange={(e) => setTemplateUsed(e.target.value as "Standard" | "Comprehensive" | "Basic")}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="Standard">Standard Template</option>
                  <option value="Comprehensive">Comprehensive Template</option>
                  <option value="Basic">Basic Template</option>
                </select>
              </div>
              
              {/* Test Results */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Test Results *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTestResult}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    + Add Result
                  </button>
                </div>
                
                {testResults.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="grid grid-cols-7 gap-2 items-center p-3 bg-gray-750 rounded-lg">
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={result.parameter}
                            onChange={(e) => handleTestResultChange(index, "parameter", e.target.value)}
                            placeholder="Parameter"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={result.value}
                            onChange={(e) => handleTestResultChange(index, "value", e.target.value)}
                            placeholder="Value"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={result.unit}
                            onChange={(e) => handleTestResultChange(index, "unit", e.target.value)}
                            placeholder="Unit"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTestResult(index)}
                            className="p-2 text-red-400 hover:text-red-300 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-750 border border-gray-700 rounded-lg text-center">
                    <p className="text-gray-400">
                      {selectedRequestId 
                        ? "Loading test parameters based on characterization types..." 
                        : "Select a sample request to see test parameters"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Form Footer */}
          <div className="border-t border-gray-700 px-6 py-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || testResults.length === 0 || !selectedRequestId}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportForm;