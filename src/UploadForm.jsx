import React, { useState } from 'react';

const UploadForm = ({ setData, resultVariation, setFileId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('result_variation', resultVariation);
      
      // Updated API endpoint to point to AWS Lambda
      const response = await fetch('https://dfrj2vec81.execute-api.ap-southeast-2.amazonaws.com/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      // Save the file ID for future reprocessing
      if (responseData.file_id) {
        setFileId(responseData.file_id);
      }
      
      // Pass the data back to the parent component
      setData(responseData.data);
      
      // Reset form
      setFile(null);
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Upload Student Data</h2>
      <p className="upload-instructions">
        Upload a CSV or Excel file containing student results data.
      </p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <label htmlFor="file-upload" className="file-input-label">
            <div className="file-input-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Choose File
            </div>
            <span className="file-name">
              {file ? file.name : "No file selected"}
            </span>
          </label>
          <input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            accept=".csv,.xls,.xlsx"
            className="file-input"
          />
        </div>
        
        <button 
          type="submit" 
          className={`upload-button ${isUploading ? 'uploading' : ''}`}
          disabled={isUploading || !file}
        >
          {isUploading ? 'Uploading...' : 'Upload and Analyze'}
        </button>
        
        {uploadError && (
          <div className="upload-error">
            {uploadError}
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadForm;