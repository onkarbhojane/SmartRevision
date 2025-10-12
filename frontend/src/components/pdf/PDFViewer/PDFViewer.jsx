import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CleanPDFViewer.css';

const PDFViewer = forwardRef((props, ref) => {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const pdfUrl = props.pdfUrl;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    goToPage: (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages && pdf) {
        setCurrentPage(pageNumber);
        renderPage(pdf, pageNumber);
      }
    },
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages
  }));

  useEffect(() => {
    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  // Add this useEffect to handle initial render when PDF is loaded
  useEffect(() => {
    if (pdf && currentPage === 1) {
      console.log('PDF loaded, rendering first page');
      renderPage(pdf, 1);
    }
  }, [pdf]);

  useEffect(() => {
    // Setup text selection handler
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && isSelectionInPDF(selection)) {
        setSelectedText(selectedText);
        
        // Get current page number and notify parent
        if (props.onTextSelect) {
          props.onTextSelect(selectedText, currentPage);
        }
      }
    };

    document.addEventListener('selectionchange', handleTextSelection);
    
    return () => {
      document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, [props.onTextSelect, currentPage]);

  const isSelectionInPDF = (selection) => {
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    const canvas = canvasRef.current;
    
    if (!canvas) return false;
    
    return canvas.contains(range.commonAncestorContainer);
  };

  const showSelectionFeedback = (message) => {
    let feedback = document.getElementById('pdf-selection-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'pdf-selection-feedback';
      feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.display = 'block';
    
    setTimeout(() => {
      feedback.style.display = 'none';
    }, 2000);
  };

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setPdf(null);
      setCurrentPage(1);
      setTotalPages(0);
      setSelectedText('');

      console.log('Loading PDF from:', pdfUrl);

      // Clear canvas while loading
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Import PDF.js
      const pdfjs = await import('pdfjs-dist/build/pdf');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      const loadingTask = pdfjs.getDocument({
        url: pdfUrl,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
        cMapPacked: true,
      });
      
      const pdfDocument = await loadingTask.promise;
      console.log('PDF loaded successfully, total pages:', pdfDocument.numPages);
      
      setPdf(pdfDocument);
      setTotalPages(pdfDocument.numPages);
      
    } catch (err) {
      console.error('PDF loading error:', err);
      setError(`Failed to load PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pdfDoc, pageNumber) => {
    try {
      if (!canvasRef.current) {
        console.error('Canvas not available');
        return;
      }

      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Clear selection
      setSelectedText('');
      const selection = window.getSelection();
      selection.removeAllRanges();

      // Calculate scale with better logic
      const container = containerRef.current;
      const containerWidth = container ? container.clientWidth - 40 : 800;
      const viewport = page.getViewport({ scale: 1 });
      
      // Calculate scale to fit container width while maintaining aspect ratio
      const calculatedScale = Math.min(
        (containerWidth - 40) / viewport.width, // Subtract padding
        1.5 // Maximum scale
      );
      
      const scaledViewport = page.getViewport({ scale: calculatedScale });
      
      // Set canvas dimensions with device pixel ratio for better quality
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(scaledViewport.width * devicePixelRatio);
      canvas.height = Math.floor(scaledViewport.height * devicePixelRatio);
      
      // Set CSS dimensions
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;

      // Scale the context for high DPI displays
      context.scale(devicePixelRatio, devicePixelRatio);

      // Clear canvas with white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, scaledViewport.width, scaledViewport.height);

      console.log(`Rendering page ${pageNumber} at scale ${calculatedScale}, dimensions: ${scaledViewport.width}x${scaledViewport.height}`);

      // Render the page with better error handling
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      await page.render(renderContext).promise;
      props.setCurrentPage(pageNumber);
      console.log(`Page ${pageNumber} rendered successfully`);
      
    } catch (err) {
      console.error('PDF rendering error:', err);
      setError(`Failed to render page ${pageNumber}: ${err.message}`);
    }
  };

  const nextPage = async () => {
    if (currentPage < totalPages && pdf) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      await renderPage(pdf, newPage);
    }
  };

  const prevPage = async () => {
    if (currentPage > 1 && pdf) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      await renderPage(pdf, newPage);
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
        .then(() => {
          showSelectionFeedback('Text copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          showSelectionFeedback('Failed to copy text');
        });
    }
  };

  // Navigate to documents page
  const goToDocuments = () => {
    navigate('/documents');
  };

  // Add a resize handler to re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdf && currentPage) {
        renderPage(pdf, currentPage);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, currentPage]);

  if (!pdfUrl) {
    return (
      <div className="error-container">
        <p>No PDF URL provided</p>
        <button onClick={goToDocuments} className="documents-button">
          📚 Back to Documents
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading PDF document...</p>
        <button onClick={goToDocuments} className="documents-button">
          📚 Back to Documents
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={loadPDF} className="retry-button">
            Try Again
          </button>
          <button onClick={downloadPDF} className="download-button">
            Download PDF
          </button>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="direct-link">
            Open PDF directly
          </a>
          <button onClick={goToDocuments} className="documents-button">
            📚 Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="clean-pdf-container" ref={containerRef}>
      <div className="pdf-controls">
        <div className="controls-left">
          <button onClick={goToDocuments} className="documents-button">
            📚 Watch Videos
          </button>
        </div>
        
        <div className="controls-center">
          <button onClick={prevPage} disabled={currentPage <= 1} className="page-button">
            ‹ Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={nextPage} disabled={currentPage >= totalPages} className="page-button">
            Next ›
          </button>
        </div>
      </div>
      
      {selectedText && (
        <div className="selected-text-preview">
          <div className="selected-text-header">
            <span>Selected Text (Page {currentPage}):</span>
            <button 
              onClick={() => setSelectedText('')} 
              className="clear-selection-button"
            >
              ×
            </button>
          </div>
          <div className="selected-text-content">
            {selectedText.length > 150 ? `${selectedText.substring(0, 150)}...` : selectedText}
          </div>
        </div>
      )}
      
      <div className="pdf-canvas-container">
        <div className="pdf-page-wrapper">
          <canvas 
            ref={canvasRef} 
            className="pdf-canvas"
            style={{ cursor: 'text' }}
          />
        </div>
      </div>
    </div>
  );
});

export default PDFViewer;