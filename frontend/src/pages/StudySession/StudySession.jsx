import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PDFViewer from "../../components/pdf/PDFViewer/PDFViewer";
import { ChatInterface } from "../../components/chat/ChatInterface/ChatInterface";
import { QuizGenerator } from "../../components/quiz/QuizGenerator/QuizGenerator";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import './StudySession.css';

const TABS = {
  CHAT: "chat",
  QUIZ: "quiz",
};

export const StudySession = () => {
  const { documentId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.CHAT);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const navigate = useNavigate();
  const pdfViewerRef = useRef(null);

  // Fetch document data and recent quizzes
  useEffect(() => {
    const fetchDocumentAndQuizzes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        // Fetch document
        const res = await fetch(
          `https://smartrevision.onrender.com/api/study/documents/${documentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (data.document) {
          setSelectedDocument(data.document);
          console.log("Fetched document:", data.document);

          // Fetch recent quizzes for this document
          try {
            const quizRes = await fetch(
              `https://smartrevision.onrender.com/api/quizzes/allquiz/${documentId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (quizRes.ok) {
              const quizData = await quizRes.json();
              // Get all quizzes (both attempted and not attempted), take latest 3
              const allQuizzes = quizData.quizzes
                ?.sort((a, b) => new Date(b.createdAt || b.attemptedAt) - new Date(a.createdAt || a.attemptedAt))
                .slice(0, 3) || [];
              
              setRecentQuizzes(allQuizzes);
              console.log("Fetched recent quizzes:", allQuizzes);
            }
          } catch (quizError) {
            console.error("Error fetching recent quizzes:", quizError);
          }
        } else {
          throw new Error("Document not found in response");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchDocumentAndQuizzes();
    }
  }, [documentId]);

  const handleTextSelect = async (text, pageNumber) => {
    console.log(`Text selected from page ${pageNumber}:`, text);
    setSelectedText(text);
    setSelectedPage(pageNumber);
    setShowTextPreview(true);
    
    // Auto-switch to chat tab when text is selected
    setActiveTab(TABS.CHAT);
    
    // Record text selection in backend
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`https://smartrevision.onrender.com/api/pdf/text-selection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfId: documentId,
          text: text,
          pageNumber: pageNumber
        })
      });
    } catch (error) {
      console.error("Failed to record text selection:", error);
    }
  };

  const handleSendToChatbot = () => {
    if (selectedText && window.chatInterfaceRef) {
      window.chatInterfaceRef.handleTextSelection(selectedText, selectedPage);
      setShowTextPreview(false);
      setSelectedText("");
    }
  };

  const handleClearSelection = () => {
    setSelectedText("");
    setShowTextPreview(false);
  };

  const handleQuizGenerated = async (quizConfig) => {
    setQuizLoading(true);
    try {
      // Generate a unique attempt ID for the new route
      const attemptId = `attempt_${Date.now()}`;
      const quizWithAttempt = {
        ...quizConfig,
        attemptId: attemptId,
        documentId: documentId,
        documentTitle: selectedDocument.title,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage for the new route to access
      localStorage.setItem(`quiz_${attemptId}`, JSON.stringify(quizWithAttempt));
      
      // Navigate to the quiz attempt page
      navigate(`/quiz/${documentId}/${attemptId}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAttemptQuiz = (quizId) => {
    const attemptId = `attempt_${Date.now()}`;
    const quizData = {
      quizId: quizId,
      documentId: documentId,
      documentTitle: selectedDocument.title,
      attemptId: attemptId,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`quiz_${attemptId}`, JSON.stringify(quizData));
    navigate(`/quiz/${documentId}/${attemptId}?quizId=${quizId}`);
  };

  // Handle page navigation from chat interface
  const handlePageNavigate = (pageNumber) => {
    console.log(`Navigating to page ${pageNumber}`);
    setSelectedPage(pageNumber);
    
    // Navigate to the specified page in PDF viewer
    if (pdfViewerRef.current && pdfViewerRef.current.goToPage) {
      pdfViewerRef.current.goToPage(pageNumber);
    }
  };

  // Handle page highlighting from chat interface
  const handlePageHighlight = (pageNumber) => {
    console.log(`Highlighting page ${pageNumber}`);
    setSelectedPage(pageNumber);
  };

  const handleViewAllQuizzes = () => {
    navigate(`/quizzes/${documentId}`);
  };

  if (loading) {
    return (
      <div className="study-session-loading">
        <div className="loading-spinner-large"></div>
        <div className="loading-text">
          <h3>Loading your study session</h3>
          <p>Preparing your document and AI tutor...</p>
        </div>
      </div>
    );
  }

  if (!selectedDocument) {
    return (
      <div className="document-error">
        <div className="error-icon">📄</div>
        <h3>Document Not Found</h3>
        <p>The document you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="study-session">
      {/* Header */}
      <div className="study-header">
        <div className="header-content">
          <div className="header-main">
            <div className="title-section">
              <h1 className="main-title">Study Session</h1>
              <p className="subtitle">Learn with your AI tutor and interactive quizzes</p>
            </div>
            <div className="document-info">
              <div className="document-badge">
                <span className="doc-emoji">📚</span>
                <div className="doc-details">
                  <h3 className="doc-title">{selectedDocument.title}</h3>
                  <p className="doc-meta">
                    Uploaded {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {selectedDocument.description && (
            <div className="document-description">
              <p>{selectedDocument.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Text Preview */}
      {showTextPreview && selectedText && (
        <div className="text-preview-overlay">
          <div className="text-preview-card">
            <div className="preview-header">
              <div className="preview-title">
                <span className="preview-icon">📑</span>
                <div>
                  <h4>Selected Text</h4>
                  <span className="page-badge">Page {selectedPage}</span>
                </div>
              </div>
              <div className="preview-actions">
                <button
                  onClick={handleSendToChatbot}
                  className="send-chat-button"
                >
                  <span>💬</span>
                  Send to AI Tutor
                </button>
                <button
                  onClick={handleClearSelection}
                  className="clear-button"
                >
                  <span>×</span>
                </button>
              </div>
            </div>
            <div className="preview-content">
              <p>{selectedText.length > 300 ? `${selectedText.substring(0, 300)}...` : selectedText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="study-layout">
        {/* PDF Viewer Section */}
        <div className="pdf-section">
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">📄</span>
              <h3>PDF Document</h3>
            </div>
            <div className="section-hint">
              <span className="hint-badge">💡</span>
              Select text to chat with AI tutor
            </div>
          </div>
          <div className="pdf-container">
            <PDFViewer 
              ref={pdfViewerRef}
              pdfUrl={selectedDocument.pdfUrl} 
              onTextSelect={handleTextSelect}
            />
          </div>
        </div>

        {/* Interactive Panel */}
        <div className="interactive-panel">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab(TABS.CHAT)}
              className={`tab-button ${activeTab === TABS.CHAT ? 'tab-active' : ''}`}
            >
              <span className="tab-icon">💬</span>
              <span className="tab-label">AI Tutor</span>
              {selectedText && activeTab !== TABS.CHAT && (
                <span className="notification-badge">!</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab(TABS.QUIZ)}
              className={`tab-button ${activeTab === TABS.QUIZ ? 'tab-active' : ''}`}
            >
              <span className="tab-icon">🎯</span>
              <span className="tab-label">Quiz</span>
              {quizLoading && (
                <div className="quiz-loading-indicator"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === TABS.CHAT && (
              <div className="chat-tab">
                <ChatInterface 
                  documentId={documentId}
                  accessToken={localStorage.getItem('accessToken')}
                  onPageNavigate={handlePageNavigate}
                  onPageHighlight={handlePageHighlight}
                />
              </div>
            )}

            {activeTab === TABS.QUIZ && (
              <div className="quiz-tab">
                <QuizGenerator
                  documentId={documentId}
                  onQuizGenerated={handleQuizGenerated}
                  documentTitle={selectedDocument.title}
                  onViewAllQuizzes={handleViewAllQuizzes}
                  isLoading={quizLoading}
                />
                
                {/* Recent Quizzes Section */}
                {recentQuizzes.length > 0 && (
                  <div className="recent-quizzes-section">
                    <div className="recent-quizzes-header">
                      <span className="recent-quizzes-icon">📊</span>
                      <h4>Recent Quizzes</h4>
                    </div>
                    <div className="recent-quizzes-list">
                      {recentQuizzes.map((quiz) => (
                        <div key={quiz._id} className="recent-quiz-item">
                          <div className="quiz-info-main">
                            <div className="quiz-type-badge">
                              {quiz.quizType?.toUpperCase() || 'QUIZ'}
                            </div>
                            <div className="quiz-details">
                              <span className="quiz-title">
                                {quiz.title || `${quiz.quizType} Quiz`}
                              </span>
                              <span className="quiz-date">
                                {new Date(quiz.createdAt || quiz.attemptedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="quiz-actions">
                            {quiz.isAttempted ? (
                              <>
                                <div className="score-display">
                                  <span className={`score-badge ${quiz.score >= 80 ? 'score-high' : quiz.score >= 60 ? 'score-medium' : 'score-low'}`}>
                                    {quiz.score}%
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleAttemptQuiz(quiz._id)}
                                  className="reattempt-quiz-button"
                                >
                                  Reattempt
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleAttemptQuiz(quiz._id)}
                                className="attempt-quiz-button"
                              >
                                Attempt
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="actions-content">
          <div className="actions-info">
            <div className="tip-container">
              <span className="tip-icon">💡</span>
              <div>
                <strong>Pro Tip:</strong> Click on page references in AI responses to jump to that page
              </div>
            </div>
          </div>
          <div className="actions-buttons">
            <button
              onClick={() => setActiveTab(TABS.CHAT)}
              className={`action-button ${activeTab === TABS.CHAT ? 'action-active' : ''}`}
            >
              <span>💬</span>
              AI Tutor
            </button>
            <button
              onClick={() => setActiveTab(TABS.QUIZ)}
              className={`action-button ${activeTab === TABS.QUIZ ? 'action-active' : ''}`}
            >
              <span>🎯</span>
              Take Quiz
            </button>
            <button
              onClick={handleViewAllQuizzes}
              className="action-button"
            >
              <span>📊</span>
              All Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};