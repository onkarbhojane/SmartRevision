import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressChart } from './ProgressChart';
import { ReviewModal } from './ReviewModal';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Sample data fallback
const sampleStats = {
  totalQuizzes: 0,
  averageScore: 0,
  studyHours: 0,
  weakAreas: [],
  strongAreas: []
};

export const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(sampleStats);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    quizId: null,
    documentId: null
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        const response = await fetch('https://smartrevision.onrender.com/api/quizzes/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch progress data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Progress data fetched:", data);
        
        if (data.data) {
          setProgressData(data.data);
          
          const transformedStats = {
            totalQuizzes: data.data.stats.totalQuizzesAttempted || 0,
            averageScore: data.data.stats.averageScore || 0,
            studyHours: Math.round((data.data.stats.totalChatSessions || 0) * 0.5),
            weakAreas: data.data.stats.weaknesses || [],
            strongAreas: data.data.stats.strengths || []
          };
          
          setStats(transformedStats);
          
          // Process recent quizzes
          const allQuizzes = [];
          data.data.study_materials?.forEach(material => {
            material.quizzes?.forEach(quiz => {
              if (quiz.isAttempted) {
                allQuizzes.push({
                  id: quiz._id,
                  title: `Quiz: ${material.title}`,
                  score: quiz.score || 0,
                  date: quiz.attemptedAt,
                  type: quiz.quizType?.toUpperCase() || 'QUIZ',
                  document: material.title,
                  documentId: material._id
                });
              }
            });
          });
          
          const sortedQuizzes = allQuizzes
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
          
          setRecentQuizzes(sortedQuizzes);
          
          // Calculate monthly progress
          calculateMonthlyProgress(allQuizzes);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        // Fallback data
        setRecentQuizzes([
          {
            id: 1,
            title: 'Physics: Thermodynamics',
            score: 92,
            date: '2023-10-05',
            type: 'MCQ',
            document: 'Physics Textbook.pdf',
            documentId: 'doc1'
          },
          {
            id: 2,
            title: 'Mathematics: Calculus',
            score: 78,
            date: '2023-10-03',
            type: 'SAQ',
            document: 'Mathematics Guide.pdf',
            documentId: 'doc2'
          }
        ]);
        
        // Calculate monthly progress with fallback data
        calculateMonthlyProgress([
          { score: 92, date: '2023-10-05' },
          { score: 78, date: '2023-10-03' },
          { score: 85, date: '2023-09-15' },
          { score: 65, date: '2023-09-10' },
          { score: 90, date: '2023-08-20' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProgressData();
    }
  }, [user]);

  const calculateMonthlyProgress = (quizzes) => {
    const monthlyData = {};
    
    quizzes.forEach(quiz => {
      const date = new Date(quiz.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthName,
          totalScore: 0,
          quizCount: 0,
          averageScore: 0
        };
      }
      
      monthlyData[monthYear].totalScore += quiz.score;
      monthlyData[monthYear].quizCount += 1;
    });
    
    // Calculate averages and convert to array
    const monthlyArray = Object.values(monthlyData).map(month => ({
      ...month,
      averageScore: Math.round(month.totalScore / month.quizCount)
    })).sort((a, b) => new Date(b.month) - new Date(a.month)).slice(0, 6);
    
    setMonthlyProgress(monthlyArray);
  };

  const handlePractice = (area) => {
    console.log(`Practice area: ${area}`);
    // Navigate to practice page or generate quiz for this area
  };

  const handleReviewQuiz = (quizId, documentId) => {
    setReviewModal({
      isOpen: true,
      quizId,
      documentId
    });
  };

  const handleCloseReview = () => {
    setReviewModal({
      isOpen: false,
      quizId: null,
      documentId: null
    });
  };

  const handleGenerateQuiz = () => {
    console.log("Generate focused quiz");
    // Implement quiz generation logic
  };

  const handleStudyMaterials = () => {
    console.log("View study materials");
    navigate(`/documents`);
  };

  // Color utilities
  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-purple-500 to-indigo-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-purple-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-emerald-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-purple-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-rose-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading Your Progress...
          </div>
          <p className="text-gray-500 mt-2">Getting everything ready for you</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Learning Progress
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Track your performance, celebrate your growth, and discover opportunities to excel
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { value: stats.totalQuizzes, label: 'Total Quizzes', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
          { value: `${stats.averageScore}%`, label: 'Average Score', icon: '🎯', gradient: 'from-purple-500 to-pink-500' },
          { value: `${stats.studyHours}h`, label: 'Study Hours', icon: '⏱️', gradient: 'from-green-500 to-emerald-500' },
          { value: stats.weakAreas.length, label: 'Areas to Improve', icon: '🚀', gradient: 'from-orange-500 to-amber-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-lg`} />
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart & Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📈</span>
              Performance Overview
            </h3>
            <ProgressChart 
              totalQuizzes={stats.totalQuizzes}
              averageScore={stats.averageScore}
              weakAreasCount={stats.weakAreas.length}
              studyHours={stats.studyHours}
              monthlyProgress={monthlyProgress}
            />
          </div>

          {/* Monthly Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              Monthly Progress
            </h3>
            <div className="space-y-4">
              {monthlyProgress.length > 0 ? (
                monthlyProgress.map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${getScoreBgColor(month.averageScore)} flex items-center justify-center font-bold ${getScoreColor(month.averageScore)} shadow-sm`}>
                        {month.averageScore}%
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{month.month}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {month.quizCount} quiz{month.quizCount !== 1 ? 'zes' : ''} attempted
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {month.averageScore}%
                      </div>
                      <div className={`text-sm font-medium ${
                        month.averageScore >= 80 ? 'text-emerald-600' :
                        month.averageScore >= 60 ? 'text-blue-600' :
                        'text-amber-600'
                      }`}>
                        {month.averageScore >= 80 ? 'Excellent' :
                         month.averageScore >= 60 ? 'Good' :
                         'Needs Improvement'}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="text-4xl mb-2">📊</div>
                  <p className="font-medium">No monthly data available</p>
                  <p className="text-sm mt-1">Complete quizzes to see your monthly progress</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Areas Analysis */}
        <div className="space-y-6">
          {/* Weak Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Areas Needing Improvement</h3>
            </div>
            <div className="space-y-3">
              {stats.weakAreas.length > 0 ? (
                stats.weakAreas.map((area, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl border border-red-100 dark:border-red-800 hover:shadow-md transition-all duration-300"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">{area}</span>
                    <button 
                      onClick={() => handlePractice(area)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 transform hover:scale-105 shadow-sm"
                    >
                      Practice
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="font-medium">No weak areas identified!</p>
                  <p className="text-sm mt-1">Keep up the great work!</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Strong Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/10 rounded-2xl border border-green-200 dark:border-green-800 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-green-600 dark:text-green-400 text-lg">⭐</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strong Areas</h3>
            </div>
            <div className="space-y-3">
              {stats.strongAreas.length > 0 ? (
                stats.strongAreas.map((area, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-xl border border-green-100 dark:border-green-800 hover:shadow-md transition-all duration-300"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">{area}</span>
                    <div className="flex items-center gap-1 text-green-500">
                      <span className="text-lg">✓</span>
                      <span className="text-sm font-medium">Strong</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  <div className="text-4xl mb-2">📚</div>
                  <p className="font-medium">Complete quizzes to see your strengths</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Quiz Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            Recent Quiz Results
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz, index) => (
              <motion.div 
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl ${getScoreBgColor(quiz.score)} flex items-center justify-center text-xl font-bold ${getScoreColor(quiz.score)} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    {quiz.score}%
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {quiz.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                        {quiz.type}
                      </span>
                      <span>•</span>
                      <span>{quiz.document}</span>
                      <span>•</span>
                      <span>{new Date(quiz.date).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleReviewQuiz(quiz.id, quiz.documentId)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Review
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Quiz Attempts Yet</p>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Start your learning journey by taking your first quiz and track your progress here!
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Smart Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm shadow-lg">
            <span className="text-2xl">💡</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">Smart Study Recommendation</h3>
            <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
              {stats.weakAreas.length > 0 ? (
                `Based on your performance analysis, we recommend focusing on ${stats.weakAreas.slice(0, 2).join(' and ')}. 
                These areas show significant potential for improvement and could boost your overall score by 15-20%.`
              ) : (
                "You're doing great! Continue exploring new topics and challenging yourself with advanced quizzes to maintain your excellent performance."
              )}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleGenerateQuiz}
                className="px-6 py-3 bg-white text-indigo-600 hover:bg-gray-100 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🎯 Generate Focused Quiz
              </button>
              <button 
                onClick={handleStudyMaterials}
                className="px-6 py-3 bg-transparent border-2 border-white text-white hover:bg-white/20 font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                📚 Study Materials
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReview}
        quizId={reviewModal.quizId}
        documentId={reviewModal.documentId}
      />
    </div>
  );
};