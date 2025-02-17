import React, { useState } from 'react';
import './ImageViewer.css';

const ImageViewer = ({ file, setError }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  return (
    <div className="image-viewer">
      {isLoading && <div className="loading">Loading image...</div>}
      <img
        src={file.url || URL.createObjectURL(file)}
        alt="Document preview"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default ImageViewer;
