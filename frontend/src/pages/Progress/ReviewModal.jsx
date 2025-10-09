import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export const ReviewModal = ({ isOpen, onClose, quizId, documentId }) => {
  const { user } = useAuth();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  useEffect(() => {
    if (isOpen && quizId && documentId) {
      fetchQuizData();
    }
  }, [isOpen, quizId, documentId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`https://smartrevision.onrender.com/api/quizzes/allquiz/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz data: ${response.status}`);
      }

      const data = await response.json();
      const quiz = data.quizzes.find(q => q._id === quizId);
      setQuizData(quiz);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerColor = (isCorrect, userAnswer, correctAnswer, option, question) => {
    if (isCorrect) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    if (!isCorrect && userAnswer === option) return 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
    if (option === correctAnswer) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    return 'border-gray-200 dark:border-gray-600';
  };

  const getAnswerIcon = (isCorrect, userAnswer, correctAnswer, option) => {
    if (isCorrect) return '✅';
    if (!isCorrect && userAnswer === option) return '❌';
    if (option === correctAnswer) return '✅';
    return '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quiz Review
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Score: {quizData?.score}% • {quizData?.totalQuestions} Questions
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-8rem)]">
              {/* Questions Sidebar */}
              <div className="lg:w-1/4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Questions</h3>
                <div className="space-y-2">
                  {quizData?.answers?.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuestion(index)}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedQuestion === index
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : question.isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Q{index + 1}</span>
                        <span>
                          {question.isCorrect ? '✅' : '❌'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Details */}
              <div className="lg:w-3/4 p-6 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading quiz details...</p>
                    </div>
                  </div>
                ) : quizData?.answers?.[selectedQuestion] ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Question {selectedQuestion + 1}
                        </h3>
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                          {quizData.answers[selectedQuestion].question}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        quizData.answers[selectedQuestion].isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {quizData.answers[selectedQuestion].isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>

                    {/* Options for MCQ */}
                    {quizData.answers[selectedQuestion].options && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Options:</h4>
                        {quizData.answers[selectedQuestion].options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                              getAnswerColor(
                                quizData.answers[selectedQuestion].isCorrect,
                                quizData.answers[selectedQuestion].userAnswer,
                                quizData.answers[selectedQuestion].correctAnswer,
                                option,
                                quizData.answers[selectedQuestion]
                              )
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">{option}</span>
                              <span>
                                {getAnswerIcon(
                                  quizData.answers[selectedQuestion].isCorrect,
                                  quizData.answers[selectedQuestion].userAnswer,
                                  quizData.answers[selectedQuestion].correctAnswer,
                                  option
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* User Answer */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Answer:</h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        {quizData.answers[selectedQuestion].userAnswer || 'No answer provided'}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Correct Answer:</h4>
                      <p className="text-emerald-700 dark:text-emerald-300">
                        {quizData.answers[selectedQuestion].correctAnswer}
                      </p>
                    </div>

                    {/* Explanation */}
                    {quizData.answers[selectedQuestion].explanation && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Explanation:</h4>
                        <p className="text-purple-700 dark:text-purple-300">
                          {quizData.answers[selectedQuestion].explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      No quiz data found
                    </p>
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