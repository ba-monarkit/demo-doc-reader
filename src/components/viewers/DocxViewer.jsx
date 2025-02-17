import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

const DocxViewer = ({ file, setError }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const docxContainer = document.createElement('div');
        docxContainer.className = 'docx-container';
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(docxContainer);
        }

        await renderAsync(arrayBuffer, docxContainer, null, {
          className: 'docx-content',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          useMathMLPolyfill: true
        });
      } catch (error) {
        console.error('Error loading DOCX:', error);
        setError('Failed to load DOCX file. Please make sure it\'s a valid document.');
      }
    };

    if (file) {
      loadDocx();
    }
  }, [file, setError]);

  return <div ref={containerRef} className="docx-viewer" />;
};

export default DocxViewer;
