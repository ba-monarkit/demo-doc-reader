import React, { useState, useRef, useEffect } from 'react';
import PdfViewer from './components/viewers/PdfViewer';
import DocxViewer from './components/viewers/DocxViewer';
import ExcelViewer from './components/viewers/ExcelViewer';
import ImageViewer from './components/viewers/ImageViewer';
import './DocsViewer.css';

const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp'
};

const DocsViewer = ({ url, fileType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  
  const containerRef = useRef(null);

  // Function to get MIME type from provided fileType
  const getMimeType = (type) => {
    // If it's already a MIME type, return it
    if (type?.includes('/')) return type;
    
    // If it's a file extension (pdf, docx, etc.), convert to MIME type
    return MIME_TYPES[type?.toLowerCase()] || 'application/octet-stream';
  };

  // Function to fetch file from URL
  const fetchFile = async (url) => {
    try {
      setLoading(true);
      setError(null);
      
      const mimeType = getMimeType(fileType);
      
      // If it's an image, use URL directly
      if (mimeType.startsWith('image/')) {
        setSelectedFile({ type: mimeType, url });
        setCurrentPage(1);
        setTotalPages(null);
        setLoading(false);
        return;
      }

      // For PDFs and other file types, fetch the data
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create a File object from the blob
      const fileName = url.split('/').pop() || 'document';
      const file = new File([blob], fileName, { type: mimeType });
      
      setSelectedFile(file);
      setCurrentPage(1);
      setTotalPages(null);
    } catch (err) {
      console.error('Error fetching file:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('CORS Error: Cannot access this file directly. The file server needs to allow cross-origin requests.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch file when URL changes
  useEffect(() => {
    if (url) {
      fetchFile(url);
    }
  }, [url]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const renderViewer = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return <ImageViewer file={selectedFile} setError={setError} />;
    } else if (selectedFile.type === 'application/pdf') {
      return (
        <>
          <PdfViewer
            file={selectedFile}
            currentPage={currentPage}
            totalPages={totalPages}
            setTotalPages={setTotalPages}
            setError={setError}
          />
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="page-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="page-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      );
    } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <DocxViewer file={selectedFile} setError={setError} />;
    } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
              selectedFile.type === 'application/vnd.ms-excel') {
      return <ExcelViewer file={selectedFile} setError={setError} />;
    }
    return null;
  };

  return (
    <div className="docs-viewer">
      {!url && (
        <div className="no-url-message">
          <p>Please provide a URL to a document</p>
          <p className="supported-formats">Supports PDF, DOCX, Excel, and Images</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="preview-container" ref={containerRef}>
        {renderViewer()}
      </div>
    </div>
  );
};

export default DocsViewer;