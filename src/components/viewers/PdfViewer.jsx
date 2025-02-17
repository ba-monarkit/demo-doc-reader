import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './PdfViewer.module.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ZOOM_STEP = 0.25;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const DEFAULT_SCALE = 1.0;

const PdfViewer = ({ file, currentPage, totalPages, setTotalPages, setError }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [baseScale, setBaseScale] = useState(DEFAULT_SCALE);

  const calculateScale = (containerWidth, viewport) => {
    // Calculate scale to fit the container width with some padding
    const padding = 40;
    return (containerWidth - padding) / viewport.width;
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + ZOOM_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - ZOOM_STEP, MIN_SCALE));
  };

  const handleResetZoom = () => {
    setScale(baseScale);
  };

  const renderPage = async (pageNumber) => {
    try {
      if (!pdfDoc) return;

      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Calculate base scale on first render or window resize
      if (scale === DEFAULT_SCALE) {
        const newScale = calculateScale(containerWidth, viewport);
        setScale(newScale);
        setBaseScale(newScale);
      }

      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      setError('Failed to render PDF page. Please try again.');
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setScale(DEFAULT_SCALE); // Reset scale when loading new document
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF file. Please make sure it\'s a valid document.');
      }
    };

    if (file) {
      loadPdf();
    }

    // Handle window resize
    const handleResize = () => {
      setScale(DEFAULT_SCALE); // Reset scale to trigger recalculation
      renderPage(currentPage);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [file, setError, setTotalPages]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, scale]);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.zoomControls}>
          <button 
            className={styles.zoomButton}
            onClick={handleZoomOut} 
            disabled={scale <= MIN_SCALE}
          >
            <span role="img" aria-label="zoom out">➖</span>
          </button>
          <button 
            className={styles.zoomButton}
            onClick={handleResetZoom} 
            disabled={scale === baseScale}
          >
            <span role="img" aria-label="reset zoom">🔄</span>
          </button>
          <button 
            className={styles.zoomButton}
            onClick={handleZoomIn} 
            disabled={scale >= MAX_SCALE}
          >
            <span role="img" aria-label="zoom in">➕</span>
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
        </div>
      </div>
      <div ref={containerRef} className={styles.viewer}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
};

export default PdfViewer;
