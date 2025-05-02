import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface FormData {
  sampleType: "" | "Metallic" | "Ceramic" | "Polymeric" | "Composite" | "Other";
  sampleDescription: string;
  characterizationType: string[];
  numberOfSamples: number;
  isFunded: boolean;
  projectNumber: string;
  sampleImage: File | null;
}

const SampleRequest = () => {
  const auth = useAuth(); 
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    sampleType: "",
    sampleDescription: "",
    characterizationType: [],
    numberOfSamples: 1,
    isFunded: false,
    projectNumber: "",
    sampleImage: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const sampleTypes = ["Metallic", "Ceramic", "Polymeric", "Composite", "Other"];
  const characterizationTypes = [
    "Tension-Static",
    "Compression-Static",
    "Torsional-Static",
    "Tension-Fatigue",
    "Compression-Fatigue",
    "Torsional-Fatigue",
    "MicroCT",
    "Hardness",
    "MicroHardness",
    "SurfaceProfilometry",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      if (name === "isFunded") {
        setFormData((prev) => ({ ...prev, [name]: !prev.isFunded }));
      } else if (name.startsWith("characterizationType_")) {
        const characterization = name.replace("characterizationType_", "");
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData((prev) => {
          if (checked) {
            return { 
              ...prev, 
              characterizationType: [...prev.characterizationType, characterization] 
            };
          } else {
            return { 
              ...prev, 
              characterizationType: prev.characterizationType.filter(type => type !== characterization) 
            };
          }
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, sampleImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.characterizationType.length === 0) {
      setError("Please select at least one characterization type.");
      return;
    }
    
    if (formData.isFunded && !formData.projectNumber) {
      setError("Please enter the project number for funded projects.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    const requestData = new FormData();
    requestData.append("sampleType", formData.sampleType);
    requestData.append("sampleDescription", formData.sampleDescription);
    formData.characterizationType.forEach(type => {
      requestData.append("characterizationType", type);
    });
    requestData.append("numberOfSamples", formData.numberOfSamples.toString());
    requestData.append("isFunded", formData.isFunded.toString());
    
    if (formData.isFunded) {
      requestData.append("projectNumber", formData.projectNumber);
    }
    
    if (formData.sampleImage) {
      requestData.append("sampleImage", formData.sampleImage);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        "http://localhost:5000/api/sample-requests", 
        requestData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess("Sample request submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setError(errorMessage || "Failed to submit request.");
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Facility Usage Charges Tab */}
      <div className="fixed right-0 top-1/2 transform translate-y-[-50%] translate-x-[-50%]">
        <div className="bg-teal-600/80 p-4 text-center rounded-l-lg shadow-lg">
          <h3 className="text-white font-medium mb-4">
            Facility Usage<br/>Charges
          </h3>
          <a 
            href="https://www.mpragati.in/_files/ugd/844b9c_3d2aac49085c45e1a4172c6dd9b03f75.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-teal-800 py-2 px-4 rounded block hover:bg-gray-100 transition-colors"
          >
            Charges
          </a>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Sample Testing Request
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Sample Type *
                </label>
                <select
                  name="sampleType"
                  value={formData.sampleType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Sample Type</option>
                  {sampleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Samples */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Number of Samples *
                </label>
                <input
                  type="number"
                  name="numberOfSamples"
                  value={formData.numberOfSamples}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Sample Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Sample Description
              </label>
              <textarea
                name="sampleDescription"
                value={formData.sampleDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Provide details about your sample..."
              />
            </div>

            {/* Characterization Types */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-400">
                Characterization Types Required *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {characterizationTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`characterizationType_${type}`}
                      name={`characterizationType_${type}`}
                      checked={formData.characterizationType.includes(type)}
                      onChange={handleChange}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                    />
                    <label htmlFor={`characterizationType_${type}`} className="ml-2 text-sm text-gray-300">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Sample Image
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <span className="text-sm text-gray-400">
                  {formData.sampleImage ? formData.sampleImage.name : "No file chosen"}
                </span>
              </div>
              {previewUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Sample preview" 
                    className="max-h-32 rounded-lg border border-gray-600" 
                  />
                </div>
              )}
            </div>

            {/* ICMR Funding */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFunded"
                  name="isFunded"
                  checked={formData.isFunded}
                  onChange={handleChange}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="isFunded" className="ml-2 text-sm text-gray-300">
                  This is an ICMR funded project
                </label>
              </div>

              {formData.isFunded && (
                <div className="pl-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Project Number *
                  </label>
                  <input
                    type="text"
                    name="projectNumber"
                    value={formData.projectNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={formData.isFunded}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SampleRequest;