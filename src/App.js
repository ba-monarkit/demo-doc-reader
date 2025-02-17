import React, { useState } from 'react';
import './App.css';
import DocsViewer from './DocsViewer';

function App() {
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerFileType, setViewerFileType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setViewerUrl(url);
    setViewerFileType(fileType);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Reader</h1>
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter document URL"
            className="url-input"
            required
          />
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="file-type-select"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">Excel</option>
            <option value="jpg">Image</option>
          </select>
          <button type="submit" className="url-button">
            View Document
          </button>
        </form>
      </header>
      <main className="App-main">
        <DocsViewer url={viewerUrl} fileType={viewerFileType} />
      </main>
    </div>
  );
}

export default App;
