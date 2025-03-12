import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadForm from "./UploadForm";
import Login from "./auth/Login";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import './App.css';
import AuthCallback from "./auth/AuthCallback";

const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const csvContent = [
    Object.keys(data[0]).map(key => `"${key}"`).join(","),  // Headers
    ...data.map(row => Object.values(row).map(value => `"${value}"`).join(",")) // Values
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const SortableDataTable = ({ data, columns, initialSortKey = null, initialSortDirection = 'ascending', secondarySortKey = null, tableTitle, title }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: initialSortKey,
    direction: initialSortDirection,
    secondaryKey: secondarySortKey
  });

  // Normalize values for sorting - enhanced to handle all ATAR text cases
  const normalizeValue = (value) => {
    // Handle null or undefined
    if (value === null || value === undefined) {
      return 0;
    }
    
    // Convert to string for text comparison (if not already a string)
    const strValue = typeof value === 'string' ? value : String(value);
    
    // Check for any text containing "ATAR" (case insensitive)
    if (strValue.toLowerCase().includes("atar")) {
      return 0; // Return number 0 for any ATAR text
    }
    
    return value;
  };

  useEffect(() => {
    // Apply initial sorting when data changes
    if (data && data.length) {
      const initialSorted = [...data];
      const sortedResult = sortData(initialSorted, sortConfig.key, sortConfig.direction, sortConfig.secondaryKey);
      setSortedData(sortedResult);
    } else {
      setSortedData([...data]);
    }
  }, [data]);

  // Function to perform the actual sorting
  const sortData = (dataToSort, key, direction, secondaryKey) => {
    if (!key) return dataToSort;

    return dataToSort.sort((a, b) => {
      // Normalize values for primary sort
      let aValue = normalizeValue(a[key]);
      let bValue = normalizeValue(b[key]);
      
      let comparison = 0;
      
      // Check if values are numeric or can be converted to numbers
      const aIsNumeric = typeof aValue === 'number' || (typeof aValue === 'string' && !isNaN(parseFloat(aValue)));
      const bIsNumeric = typeof bValue === 'number' || (typeof bValue === 'string' && !isNaN(parseFloat(bValue)));
      
      if (aIsNumeric && bIsNumeric) {
        // Ensure we're comparing numbers, not strings
        const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue);
        const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue);
        comparison = direction === 'ascending' ? aNum - bNum : bNum - aNum;
      } else {
        // Convert to strings for consistent string comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        comparison = direction === 'ascending' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }
      
      // If primary sort keys are equal and we have a secondary sort key
      if (comparison === 0 && secondaryKey) {
        // Always sort secondary key in descending order for scaled scores
        const aSecondary = normalizeValue(a[secondaryKey]);
        const bSecondary = normalizeValue(b[secondaryKey]);
        
        const aSecIsNumeric = typeof aSecondary === 'number' || (typeof aSecondary === 'string' && !isNaN(parseFloat(aSecondary)));
        const bSecIsNumeric = typeof bSecondary === 'number' || (typeof bSecondary === 'string' && !isNaN(parseFloat(bSecondary)));
        
        if (aSecIsNumeric && bSecIsNumeric) {
          // Ensure we're comparing numbers, not strings
          const aSecNum = typeof aSecondary === 'number' ? aSecondary : parseFloat(aSecondary);
          const bSecNum = typeof bSecondary === 'number' ? bSecondary : parseFloat(bSecondary);
          return bSecNum - aSecNum; // For scaled score, always descending order
        } else {
          // Convert to strings for consistent string comparison
          const aSecStr = String(aSecondary);
          const bSecStr = String(bSecondary);
          return bSecStr.localeCompare(aSecStr); // Descending order
        }
      }
      
      return comparison;
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    let secondaryKey = sortConfig.secondaryKey;
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    const newSortedData = [...data]; // Start with original data
    const sortedResult = sortData(newSortedData, key, direction, secondaryKey);
    
    setSortedData(sortedResult);
    setSortConfig({ key, direction, secondaryKey });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return '⇅';
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const handleDownload = () => {
    downloadCSV(sortedData, `${tableTitle || 'data'}.csv`);
  };

  if (!data || data.length === 0) return <p className="no-data">No data available.</p>;
  
  return (
    <div className="table-container">
      {/* New table header with title and download button inline */}
      <div className="table-header">
        {title && <h2>{title}</h2>}
        <div className="table-actions">
          <button className="download-btn" onClick={handleDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download CSV
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((key) => (
                <th 
                  key={key} 
                  onClick={() => requestSort(key)}
                  className={sortConfig.key === key ? `sorted-${sortConfig.direction}` : ''}
                >
                  <div className="th-content">
                    <span>{key}</span>
                    <span className="sort-icon">{getSortIndicator(key)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                {columns.map((key, idx) => (
                  <td key={idx}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Regular non-sortable table (kept for the summary view)
const DataTable = ({ data, columns, tableTitle, customHeaders, title }) => {
  if (!data || data.length === 0) return <p className="no-data">No data available.</p>;
  
  const handleDownload = () => {
    downloadCSV(data, `${tableTitle || 'data'}.csv`);
  };
  
  // Use customHeaders if provided, otherwise use columns
  const displayHeaders = customHeaders || columns;
  
  return (
    <div className="table-container">
      {/* New table header with title and download button inline */}
      <div className="table-header">
        {title && <h2>{title}</h2>}
        <div className="table-actions">
          <button className="download-btn" onClick={handleDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download CSV
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {displayHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                {columns.map((columnKey, colIndex) => (
                  <td key={colIndex}>{row[columnKey]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main application component that will be protected by authentication
const MainAppContent = () => {
  const [data, setData] = useState(null);
  const [view, setView] = useState("upload");
  const [resultVariation, setResultVariation] = useState(3);
  const [hasUploadedData, setHasUploadedData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileId, setFileId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [filteredData, setFilteredData] = useState({
    subject_data: null,
    students: null,
    "Student Ranged ATARs": null,
    "Student Ranged Atar Summary": null
  });
  
  const { user, logout, createPortalSession } = useAuth();

  useEffect(() => {
    console.log("Data received in App:", data);
    // When data is set, update the hasUploadedData flag
    if (data) {
      setHasUploadedData(true);
      setFilteredData({
        subject_data: data.subject_data,
        students: data.students,
        "Student Ranged ATARs": data["Student Ranged ATARs"],
        "Student Ranged Atar Summary": data["Student Ranged Atar Summary"]
      });
    }
  }, [data]);
  
  // Filter data based on search term
  useEffect(() => {
    if (!data) return;
    
    const filterStudentData = () => {
      // Filter subject data if it exists
      const filteredSubjectData = data.subject_data 
        ? data.subject_data.filter(item => 
            item["Student Name"]?.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;
      
      // Filter students data if it exists
      const filteredStudents = data.students
        ? data.students.filter(item => 
            item["Student Name"]?.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;
      
      // Filter Student Ranged ATARs if it exists
      const filteredRangedATARs = data["Student Ranged ATARs"]
        ? data["Student Ranged ATARs"].filter(item => 
            item["Student Name"]?.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;
      
      // Filter Student Ranged Atar Summary if it exists
      const filteredRangedAtarSummary = data["Student Ranged Atar Summary"]
        ? data["Student Ranged Atar Summary"].filter(item => 
            item["Student Name"]?.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;
      
      setFilteredData({
        subject_data: filteredSubjectData,
        students: filteredStudents,
        "Student Ranged ATARs": filteredRangedATARs,
        "Student Ranged Atar Summary": filteredRangedAtarSummary
      });
    };
    
    if (searchTerm.trim() === '') {
      // If search is empty, reset to original data
      setFilteredData({
        subject_data: data.subject_data,
        students: data.students,
        "Student Ranged ATARs": data["Student Ranged ATARs"],
        "Student Ranged Atar Summary": data["Student Ranged Atar Summary"]
      });
    } else {
      filterStudentData();
    }
  }, [searchTerm, data]);

  // Function to handle variation changes after data is already loaded
  const handleVariationChange = async (newVariation) => {
    // Skip if new variation is not a valid number
    if (newVariation === '' || isNaN(newVariation)) {
      return;
    }
    
    // Update the local state first for immediate UI feedback
    setResultVariation(newVariation);
    
    // Only process if we have a fileId
    if (!fileId) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Create form data for the reprocess request
      const formData = new FormData();
      formData.append('file_id', fileId);
      formData.append('result_variation', newVariation.toString());
      
      // Send request to reprocess the data with new variation
      const response = await fetch('https://dfrj2vec81.execute-api.ap-southeast-2.amazonaws.com/reprocess/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Processing failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      // Update the data with the newly processed results
      setData(responseData.data);
      
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingError(error.message || "An error occurred while updating variation");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle data upload
  const handleDataUpload = (newData) => {
    setData(newData);
    setHasUploadedData(true);
    setView("subjects"); // Optionally navigate to subjects view after upload
  };

  // Clear all data and reset the app
  const handleClearData = () => {
    // Show confirmation dialog before clearing data
    if (window.confirm("Clearing data removes your uploaded data. Are you sure you want to do this?")) {
      setData(null);
      setFileId(null);
      setHasUploadedData(false);
      setView("upload");
      setResultVariation(3); // Reset to default variation
      setSearchTerm('');
      setProcessingError(null);
    }
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    await createPortalSession();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ATAR Predictor</h1>
        <div className="user-controls">
          {user && (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ color: '#666' }}>
                {user.email}
              </span>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '14px' }}
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </button>
              <button 
                className="btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '14px' }}
                onClick={logout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="content-container">
        <nav className="navigation-tabs">
          <button 
            className={view === "upload" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("upload")}
          >
            Upload File
          </button>
          <button 
            className={view === "subjects" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("subjects")} 
            disabled={!data?.subject_data}
          >
            Student Results
          </button>
          <button 
            className={view === "ranged" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("ranged")} 
            disabled={!data?.["Student Ranged ATARs"]}
          >
            Student Ranged Results
          </button>
          <button 
            className={view === "atars" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("atars")} 
            disabled={!data?.students}
          >
            Student ATARs
          </button>
          <button 
            className={view === "ranged_summary" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("ranged_summary")} 
            disabled={!data?.["Student Ranged Atar Summary"]}
          >
            Student Ranged ATARs
          </button>
          <button 
            className={view === "summary" ? "nav-btn active" : "nav-btn"}
            onClick={() => setView("summary")} 
            disabled={!data?.["ATAR Eligible Students"]}
          >
            School Summary
          </button>
          {/* Clear data button shown after upload */}
          {hasUploadedData && (
            <button 
              className="clear-data-btn" 
              onClick={handleClearData}
            >
              Clear Data
            </button>
          )}
        </nav>
        
        {/* Search box with variation control - using class to control visibility */}
        <div className={`search-wrapper ${hasUploadedData && view !== "upload" ? 'visible' : ''}`}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Variation control shown next to search after upload */}
          <div className="slider-container">
            <label htmlFor="dynamic-variation-input">
              Result Variation:
              {isProcessing && <span className="processing-indicator">(Processing...)</span>}
            </label>
            <div className="variation-help-text">(1-10)</div>
            <div className="number-input-container">
              <input
                id="dynamic-variation-input"
                type="number"
                min="1"
                max="10"
                step="1"
                value={resultVariation}
                onChange={(e) => {
                  // Check if input is empty
                  if (e.target.value === '') {
                    setResultVariation('');
                    return;
                  }
                  
                  // Parse the input value
                  const inputValue = parseInt(e.target.value, 10);
                  
                  // Only validate and process if it's a valid number
                  if (!isNaN(inputValue)) {
                    const value = Math.min(10, Math.max(1, inputValue));
                    setResultVariation(value);
                    
                    // Only trigger API call if the value is different
                    if (value !== resultVariation) {
                      handleVariationChange(value);
                    }
                  }
                }}
                disabled={isProcessing}
                className="number-input"
              />
              <div className="number-input-controls">
                <button 
                  className="number-input-button" 
                  onClick={() => {
                    const currentValue = parseInt(resultVariation, 10) || 1;
                    const newValue = Math.min(10, currentValue + 1);
                    handleVariationChange(newValue);
                  }}
                  disabled={isProcessing || resultVariation >= 10}
                >
                  ▲
                </button>
                <button 
                  className="number-input-button" 
                  onClick={() => {
                    const currentValue = parseInt(resultVariation, 10) || 1;
                    const newValue = Math.max(1, currentValue - 1);
                    handleVariationChange(newValue);
                  }}
                  disabled={isProcessing || resultVariation <= 1}
                >
                  ▼
                </button>
              </div>
            </div>
            {processingError && (
              <div className="processing-error">{processingError}</div>
            )}
          </div>
        </div>

        <main className="main-content">
          {view === "upload" && (
            <div className="content-card">
              <UploadForm 
                setData={handleDataUpload} 
                resultVariation={resultVariation.toString()}
                setFileId={setFileId}
              />
            </div>
          )} 
          
          {view === "subjects" && filteredData?.subject_data && data?.students && (
            <div className="content-card">
              <SortableDataTable 
                data={filteredData.subject_data} 
                columns={["Student Name", "Subject", "Subject Type", "Result", "Scaled Score", "TE Score", "ATAR"]}
                initialSortKey="Student Name"
                initialSortDirection="ascending"
                secondarySortKey="Scaled Score"
                tableTitle="Student_Subjects"
                title="Student Subjects"
              />
            </div>
          )}
          
          {view === "atars" && filteredData?.students && (
            <div className="content-card">
              <SortableDataTable 
                data={filteredData.students} 
                columns={["Student Name", "TE Score", "ATAR"]}
                tableTitle="Student_ATARs"
                title="Student ATARs"
              />
            </div>
          )}
          
          {view === "ranged" && filteredData?.["Student Ranged ATARs"] && (
            <div className="content-card">
              <SortableDataTable 
                data={filteredData["Student Ranged ATARs"]} 
                columns={Object.keys(data["Student Ranged ATARs"][0] || {})}
                tableTitle="Student_Ranged_ATARs"
                title="Student Ranged ATARs"
              />
            </div>
          )}
          
          {view === "ranged_summary" && filteredData?.["Student Ranged Atar Summary"] && (
            <div className="content-card">
              <SortableDataTable 
                data={filteredData["Student Ranged Atar Summary"]} 
                columns={Object.keys(data["Student Ranged Atar Summary"][0] || {})}
                tableTitle="Student_Ranged_Atar_Summary"
                title="Student Ranged ATARs"
              />
            </div>
          )}
          
          {view === "summary" && data?.["ATAR Eligible Students"] !== undefined && (
            <div className="content-card">
              <h2>School Summary</h2>
              <div className="summary-stats">
                <div className="stat-card">
                  <h3>ATAR Eligible Students</h3>
                  <div className="stat-value">{data["ATAR Eligible Students"]}</div>
                </div>
                <div className="stat-card">
                  <h3>Median ATAR</h3>
                  <div className="stat-value">{data["Median ATAR"] || "N/A"}</div>
                </div>
              </div>
              <h3>ATAR Distribution</h3>
              {data["ATAR Distribution"] && data["ATAR Distribution"].length > 0 && (
                <DataTable 
                  data={data["ATAR Distribution"]} 
                  columns={Object.keys(data["ATAR Distribution"][0])}
                  customHeaders={["ATAR greater than", "No. of students", "% of ATAR eligible students"]}
                  tableTitle="ATAR_Distribution"
                  title="ATAR Distribution"
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
	   <Route path="/auth-callback" element={<AuthCallback />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainAppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;