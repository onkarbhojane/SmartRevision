import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

// Mock service for document operations
const documentService = {
  async uploadDocument(formData, token) {
    const response = await fetch("http://localhost:5000/api/documents/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async getUserDocuments(token) {
    const response = await fetch(
      "http://localhost:5000/api/documents/getData",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async deleteDocument(documentId, token) {
    const response = await fetch(
      `http://localhost:5000/api/documents/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async getYouTubeRecommendations(documentId, pageNumber, token) {
    const response = await fetch(
      `http://localhost:5000/api/youtube/${documentId}/page/${pageNumber}/youtube-recommendations`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube recommendations: ${response.statusText}`);
    }
    
    return await response.json();
  },
};

// YouTube Recommendations Modal Component
const YouTubeRecommendationsModal = ({ 
  isOpen, 
  onClose, 
  documentTitle, 
  pageNumber,
  pageContent,
  recommendations = [],
  loading = false,
  message = null 
}) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (publishedAt) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInDays = Math.floor((now - published) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Video Recommendations
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Page {pageNumber} • {documentTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-8rem)]">
              {/* Page Content Sidebar */}
              <div className="lg:w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 overflow-y-auto">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>📄</span>
                  Page Content Preview
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                    {pageContent || "No content available for this page."}
                  </div>
                </div>
                
                {/* Learning Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Learning Tip
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {message || "Watch these videos to reinforce your understanding of the concepts from this page."}
                  </p>
                </div>
              </div>

              {/* YouTube Videos */}
              <div className="lg:w-2/3 p-6 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Finding the best videos for you...</p>
                    </div>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Recommended Videos ({recommendations.length})
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>🎯</span>
                        <span>Personalized for this content</span>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {recommendations.map((video, index) => (
                        <motion.div
                          key={video.videoId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
                        >
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0">
                            <div className="w-full sm:w-48 h-32 bg-gray-300 dark:bg-gray-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                              <span className="text-4xl">🎬</span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.duration)}
                            </div>
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                              YouTube
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {video.title}
                            </h4>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span className="flex items-center space-x-1">
                                <span>👤</span>
                                <span>{video.channelTitle}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>👁️</span>
                                <span>{video.viewCount.toLocaleString()} views</span>
                              </span>
                              <span>{getTimeAgo(video.publishedAt)}</span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                              {video.description}
                            </p>

                            {/* Relevance Score */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${video.relevanceScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {video.relevanceScore}% relevant
                                </span>
                              </div>
                              
                              <a
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 group"
                              >
                                <span>▶️</span>
                                <span>Watch</span>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {message ? "No Educational Content" : "No Videos Found"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {message || "We couldn't find any relevant YouTube videos for this page content. Try studying the material directly or check back later."}
                    </p>
                    {message && (
                      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          This page appears to be a cover page, table of contents, or doesn't contain educational content suitable for video recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Page Selection Modal Component
const PageSelectionModal = ({ 
  isOpen, 
  onClose, 
  document: doc, 
  onPageSelect 
}) => {
  const [selectedPage, setSelectedPage] = useState(null);

  const handlePageSelect = (pageNumber) => {
    setSelectedPage(pageNumber);
    onPageSelect(pageNumber);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select a Page
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Choose a page to get video recommendations
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Page Grid */}
            <div className="p-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-96 overflow-y-auto">
                {Array.from({ length: doc.pages?.length || 0 }, (_, i) => i + 1).map((pageNum) => (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageSelect(pageNum)}
                    className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {pageNum}
                    </span>
                  </motion.button>
                ))}
              </div>

              {(!doc.pages || doc.pages.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📄</div>
                  <p>No pages available for this document</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user, getTokens } = useAuth();
  const { isDark } = useTheme();

  // YouTube recommendations state
  const [showPageSelection, setShowPageSelection] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [youTubeRecommendations, setYouTubeRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState(null);

  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = async () => {
    try {
      setError(null);
      const { accessToken } = getTokens();
      const data = await documentService.getUserDocuments(accessToken);
      
      let documentsData = [];
      if (data.documents) {
        documentsData = data.documents.study_materials;
      }
      
      const processedDocuments = documentsData.map(doc => ({
        ...doc,
        pages: Array.isArray(doc.pages) ? doc.pages : [],
        title: doc.title || "Untitled Document",
        subject: doc.subject || "General",
        uploadedAt: doc.uploadedAt || doc.uploadDate || new Date(),
        quizzes: Array.isArray(doc.quizzes) ? doc.quizzes : [],
        chat_sessions: Array.isArray(doc.chat_sessions) ? doc.chat_sessions : [],
      }));
      
      setDocuments(processedDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError("Failed to load documents. Please try again.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    
    try {
      const { accessToken } = getTokens();

      for (const file of files) {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("title", file.name.replace(".pdf", ""));
        formData.append(
          "description",
          `Uploaded ${new Date().toLocaleDateString()}`
        );

        const result = await documentService.uploadDocument(
          formData,
          accessToken
        );

        if (result.success) {
          const newDocument = result.document || result.study_material;
          if (newDocument) {
            setDocuments((prev) => [{
              ...newDocument,
              pages: Array.isArray(newDocument.pages) ? newDocument.pages : [],
              title: newDocument.title || file.name.replace(".pdf", ""),
              subject: newDocument.subject || "General",
              uploadedAt: newDocument.uploadedAt || new Date(),
            }, ...prev]);
          }
        }
      }

      setShowUpload(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      setError(null);
      const { accessToken } = getTokens();
      const result = await documentService.deleteDocument(
        documentId,
        accessToken
      );

      if (result.success) {
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Delete failed. Please try again.");
    }
  };

  // YouTube recommendations handlers
  const handleShowYouTubeRecommendations = (document) => {
    setSelectedDocument(document);
    setShowPageSelection(true);
    // Reset previous state
    setYouTubeRecommendations([]);
    setRecommendationMessage(null);
  };

  const handlePageSelect = async (pageNumber) => {
    setSelectedPage(pageNumber);
    setShowPageSelection(false);
    setLoadingRecommendations(true);
    setShowYouTubeModal(true);
    setYouTubeRecommendations([]);
    setRecommendationMessage(null);

    try {
      const { accessToken } = getTokens();
      const data = await documentService.getYouTubeRecommendations(
        selectedDocument._id,
        pageNumber,
        accessToken
      );
      
      console.log("YouTube API Response:", data);
      
      if (data.success) {
        if (data.recommendations && data.recommendations.length > 0) {
          setYouTubeRecommendations(data.recommendations);
          setRecommendationMessage(null);
        } else {
          // No recommendations - check if there's a message from backend
          setYouTubeRecommendations([]);
          setRecommendationMessage(
            data.message || "No video recommendations available for this page content."
          );
        }
      } else {
        throw new Error(data.message || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("Error fetching YouTube recommendations:", error);
      setYouTubeRecommendations([]);
      setRecommendationMessage(
        error.message || "Failed to load video recommendations. Please try again later."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getPageContent = (pageNumber) => {
    if (!selectedDocument?.pages || !Array.isArray(selectedDocument.pages)) {
      return "No content available";
    }
    
    const page = selectedDocument.pages[pageNumber - 1];
    return page?.text || page?.summary || "No content available for this page.";
  };

  const formatDate = (date) => {
    try {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getPageCount = (document) => {
    if (!document.pages || !Array.isArray(document.pages)) return "N/A";
    return document.pages.length;
  };

  const generateDocumentThumbnail = (document, index) => {
    const subjectIcons = {
      Physics: ["⚛️", "🔭", "⚡", "🌌"],
      Chemistry: ["🧪", "🔬", "⚗️", "🌡️"],
      Mathematics: ["📐", "🔢", "📊", "∞"],
      Biology: ["🧬", "🔬", "🌿", "🦠"],
      General: ["📚", "🎓", "📖", "✏️"],
    };

    const colorSchemes = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-pink-600",
      "from-teal-500 to-blue-600",
      "from-yellow-500 to-orange-600",
    ];

    const patterns = ["🔮✨", "🌟📖", "🎯🔍", "💡📚", "🚀🎓", "🌈✏️"];

    const subject = document.subject || "General";
    const icons = subjectIcons[subject] || subjectIcons.General;
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const pattern = patterns[index % patterns.length];

    return (
      <div
        className={`w-full h-40 bg-gradient-to-br ${colorScheme} rounded-xl flex items-center justify-center text-white relative overflow-hidden group`}
      >
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="absolute -top-4 -right-4 text-6xl rotate-12">
            {pattern}
          </div>
          <div className="absolute -bottom-4 -left-4 text-4xl -rotate-12">
            {pattern}
          </div>
        </div>

        <div className="text-center relative z-10 transform group-hover:scale-110 transition-transform">
          <div className="text-4xl mb-2">{icons[0]}</div>
          <div className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
            {getPageCount(document)} pages • {subject}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    );
  };

  // Error display component
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Error Loading Documents
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={loadUserDocuments}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 mt-4 sm:mt-0 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
            >
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Learning Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            {documents.length === 0
              ? "Transform your PDFs into interactive learning experiences"
              : `You have ${documents.length} document${documents.length !== 1 ? "s" : ""} ready to explore`}
          </p>
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(true)}
          className="mt-4 sm:mt-0 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all flex items-center space-x-3 group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">
            📚
          </span>
          <span className="text-lg">Upload New Document</span>
        </motion.button>
      </motion.div>

      {/* Enhanced Upload Modal */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload Learning Material
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Turn your PDF into an interactive study session
                </p>
              </div>
              <button
                onClick={() => !uploading && setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                disabled={uploading}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 transition-all cursor-pointer group"
              onClick={() =>
                !uploading && document.getElementById("pdf-upload")?.click()
              }
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📄</span>
              </div>
              <h4 className="font-bold text-2xl text-gray-900 dark:text-white mb-3">
                Drop your study material here
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Upload PDFs, notes, or textbooks to create interactive learning
                experiences
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) =>
                  handleUploadComplete(Array.from(e.target.files))
                }
                className="hidden"
                id="pdf-upload"
                disabled={uploading}
              />
              <motion.label
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                htmlFor="pdf-upload"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 text-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing your document...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎯</span>
                    Choose Files to Upload
                  </>
                )}
              </motion.label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Supported format: PDF • Max size: 50MB
              </p>
            </motion.div>

            {/* Upload Features */}
            {!uploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4 mt-8"
              >
                {[
                  { icon: "🤖", text: "AI Analysis" },
                  { icon: "🎯", text: "Smart Quizzes" },
                  { icon: "💬", text: "Chat Support" },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {feature.text}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Documents Grid */}
      {documents.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-120"
        >
          {documents.map((document, index) => (
            <motion.div
              key={document._id || index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-110 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              {/* Enhanced Thumbnail */}
              {generateDocumentThumbnail(document, index)}

              <div className="p-6">
                {/* Document Info */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg leading-tight">
                    {document.title || "Untitled Document"}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Subject
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-xs">
                        {document.subject || "General"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Pages
                      </span>
                      <span className="font-semibold">
                        {getPageCount(document)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Uploaded
                      </span>
                      <span className="font-semibold">
                        {formatDate(document.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <span>🎯</span>
                      <span>{document.quizzes?.length || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                      <span>💬</span>
                      <span>{document.chat_sessions?.length || 0}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/study/${document._id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all text-center flex items-center justify-center space-x-2 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      📖
                    </span>
                    <span>Study</span>
                  </Link>

                  <Link
                    to={`/quizzes/${document._id}`}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all text-center flex items-center justify-center space-x-2 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      🎯
                    </span>
                    <span>Quiz</span>
                  </Link>

                  {/* YouTube Recommendations Button */}
                  <button
                    onClick={() => handleShowYouTubeRecommendations(document)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all text-center flex items-center justify-center space-x-2 group"
                    title="Get video recommendations"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      🎬
                    </span>
                    <span>Videos</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(document._id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                    title="Delete document"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Enhanced Empty State */
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <span className="text-5xl">📚</span>
          </motion.div>

          <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Learning Journey Starts Here
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your first PDF and unlock AI-powered learning with instant
            explanations, personalized quizzes, and interactive study sessions.
          </p>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all text-lg flex items-center space-x-3 mx-auto group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              🚀
            </span>
            <span>Upload Your First Document</span>
          </motion.button>

          {/* Enhanced Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto"
          >
            {[
              {
                icon: "🤖",
                title: "AI-Powered Analysis",
                description:
                  "Get instant explanations and personalized guidance from our intelligent tutor",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: "🎯",
                title: "Adaptive Quizzes",
                description:
                  "Generate smart quizzes that adapt to your learning pace and progress",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "📊",
                title: "Progress Analytics",
                description:
                  "Track your learning journey with detailed insights and recommendations",
                color: "from-green-500 to-teal-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* YouTube Modals */}
      <PageSelectionModal
        isOpen={showPageSelection}
        onClose={() => setShowPageSelection(false)}
        document={selectedDocument}
        onPageSelect={handlePageSelect}
      />

      <YouTubeRecommendationsModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        documentTitle={selectedDocument?.title}
        pageNumber={selectedPage}
        pageContent={getPageContent(selectedPage)}
        recommendations={youTubeRecommendations}
        loading={loadingRecommendations}
        message={recommendationMessage}
      />
    </div>
  );
};