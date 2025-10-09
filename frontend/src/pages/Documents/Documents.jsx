import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

// Mock service for document operations
const documentService = {
  async uploadDocument(formData, token) {
    const response = await fetch('https://smartrevision.onrender.com/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  },

  async getUserDocuments(token) {
    const response = await fetch('https://smartrevision.onrender.com/api/documents/getData', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  },

  async deleteDocument(documentId, token) {
    const response = await fetch(`https://smartrevision.onrender.com/api/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  }
};

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user, getTokens } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = async () => {
    try {
      const { accessToken } = getTokens();
      const data = await documentService.getUserDocuments(accessToken);
      setDocuments(data.documents?.study_materials || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]); // No sample data - keep it empty
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { accessToken } = getTokens();
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', file.name.replace('.pdf', ''));
        formData.append('description', `Uploaded ${new Date().toLocaleDateString()}`);

        const result = await documentService.uploadDocument(formData, accessToken);
        
        if (result.success) {
          setDocuments(prev => [result.document, ...prev]);
        }
      }
      
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const { accessToken } = getTokens();
      const result = await documentService.deleteDocument(documentId, accessToken);
      
      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  // Generate beautiful document thumbnails with random academic-themed illustrations
  const generateDocumentThumbnail = (document, index) => {
    const subjectIcons = {
      Physics: ['⚛️', '🔭', '⚡', '🌌'],
      Chemistry: ['🧪', '🔬', '⚗️', '🌡️'],
      Mathematics: ['📐', '🔢', '📊', '∞'],
      Biology: ['🧬', '🔬', '🌿', '🦠'],
      General: ['📚', '🎓', '📖', '✏️']
    };

    const colorSchemes = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-blue-600',
      'from-yellow-500 to-orange-600'
    ];

    const patterns = [
      '🔮✨', '🌟📖', '🎯🔍', '💡📚', '🚀🎓', '🌈✏️'
    ];

    const subject = document.subject || 'General';
    const icons = subjectIcons[subject] || subjectIcons.General;
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const pattern = patterns[index % patterns.length];

    return (
      <div className={`w-full h-40 bg-gradient-to-br ${colorScheme} rounded-xl flex items-center justify-center text-white relative overflow-hidden group`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="absolute -top-4 -right-4 text-6xl rotate-12">{pattern}</div>
          <div className="absolute -bottom-4 -left-4 text-4xl -rotate-12">{pattern}</div>
        </div>
        
        {/* Main content */}
        <div className="text-center relative z-10 transform group-hover:scale-110 transition-transform">
          <div className="text-4xl mb-2">{icons[0]}</div>
          <div className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {document.pages || '?'} pages • {subject}
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    );
  };

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
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
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
              : `You have ${documents.length} document${documents.length !== 1 ? 's' : ''} ready to explore`}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(true)}
          className="mt-4 sm:mt-0 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all flex items-center space-x-3 group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Learning Material</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Turn your PDF into an interactive study session</p>
              </div>
              <button
                onClick={() => !uploading && setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                disabled={uploading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 transition-all cursor-pointer group"
              onClick={() => !uploading && document.getElementById('pdf-upload')?.click()}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📄</span>
              </div>
              <h4 className="font-bold text-2xl text-gray-900 dark:text-white mb-3">
                Drop your study material here
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Upload PDFs, notes, or textbooks to create interactive learning experiences
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => handleUploadComplete(Array.from(e.target.files))}
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
                  { icon: '🤖', text: 'AI Analysis' },
                  { icon: '🎯', text: 'Smart Quizzes' },
                  { icon: '💬', text: 'Chat Support' }
                ].map((feature, idx) => (
                  <div key={idx} className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">{feature.text}</div>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {documents.map((document, index) => (
            <motion.div
              key={document._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              {/* Enhanced Thumbnail */}
              {generateDocumentThumbnail(document, index)}
              
              <div className="p-6">
                {/* Document Info */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg leading-tight">
                    {document.title || document.name}
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Subject</span>
                      <span className="font-semibold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-xs">
                        {document.subject || 'General'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Pages</span>
                      <span className="font-semibold">{document.pages || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Uploaded</span>
                      <span className="font-semibold">
                        {new Date(document.uploadedAt || document.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <span>🎯</span>
                      <span>{document.quiz_attempts?.length || 0}</span>
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
                    <span className="group-hover:scale-110 transition-transform">📖</span>
                    <span>Study</span>
                  </Link>
                  
                  <Link
                    to={`/quizzes/${document._id}`}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all text-center flex items-center justify-center space-x-2 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">🎯</span>
                    <span>Quiz</span>
                  </Link>
                  
                  <button 
                    onClick={() => handleDeleteDocument(document._id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                    title="Delete document"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <span className="text-5xl">📚</span>
          </motion.div>
          
          <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Learning Journey Starts Here
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your first PDF and unlock AI-powered learning with instant explanations, 
            personalized quizzes, and interactive study sessions.
          </p>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all text-lg flex items-center space-x-3 mx-auto group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
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
                icon: '🤖',
                title: 'AI-Powered Analysis',
                description: 'Get instant explanations and personalized guidance from our intelligent tutor',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🎯',
                title: 'Adaptive Quizzes',
                description: 'Generate smart quizzes that adapt to your learning pace and progress',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '📊',
                title: 'Progress Analytics',
                description: 'Track your learning journey with detailed insights and recommendations',
                color: 'from-green-500 to-teal-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};