import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export const QuizzesPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `http://localhost:5000/api/quizzes/allquiz/${documentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("API Response:", response.data);
        setQuizzes(response.data.quizzes || []);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [documentId]);

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-green-500 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "⭐";
    if (score >= 70) return "👍";
    if (score >= 60) return "💪";
    if (score >= 50) return "📚";
    return "🎯";
  };

  const getPerformanceText = (score) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great Job!";
    if (score >= 70) return "Good Work!";
    if (score >= 60) return "Not Bad!";
    if (score >= 50) return "Keep Trying!";
    return "Needs Practice";
  };

  const getStatusBadge = (quiz) => {
    if (!quiz.isAttempted) {
      return {
        text: "Not Attempted",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "⏳"
      };
    }
    if (quiz.score >= 70) {
      return {
        text: "Passed",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "✅"
      };
    }
    return {
      text: "Failed",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: "❌"
    };
  };

  const calculateAccuracy = (quiz) => {
    if (!quiz.answers || quiz.answers.length === 0 || !quiz.isAttempted) return 0;
    const correctAnswers = quiz.answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / quiz.answers.length) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleCloseDetails = () => {
    setSelectedQuiz(null);
  };

  const handleAttemptQuiz = (quiz) => {
    console.log('Attempting quiz...', quiz);
    // if (quiz.isAttempted) {
    //   // Re-attempt - navigate to quiz with existing attempt ID
      
    // } else {
    //   // First attempt - navigate to new quiz
    //   navigate(`/quiz/${documentId}`);
    // }
    navigate(`/quiz/${documentId}/${quiz._id}`);
  };

  const handleNewQuiz = () => {
    navigate(`/study/${documentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your quizzes...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching your performance data</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quizzes Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't taken any quizzes for this document yet. Start your learning journey by taking a quiz!
          </p>
          <button
            onClick={handleNewQuiz}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Take Your First Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Quiz History</h1>
          <p className="text-gray-600 text-lg">Track your learning progress and performance</p>
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-flex items-center gap-6 px-6 py-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{quizzes.length}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {quizzes.filter(quiz => quiz.isAttempted && quiz.score >= 70).length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {quizzes.filter(quiz => quiz.isAttempted).length}
              </div>
              <div className="text-sm text-gray-600">Attempted</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {quizzes.filter(quiz => !quiz.isAttempted).length}
              </div>
              <div className="text-sm text-gray-600">Not Attempted</div>
            </div>
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quizzes.map((quiz, index) => {
            const accuracy = calculateAccuracy(quiz);
            const performance = quiz.isAttempted ? getPerformanceText(quiz.score) : "Not Attempted";
            const scoreColor = quiz.isAttempted ? getScoreColor(quiz.score) : "text-gray-600 bg-gray-50 border-gray-200";
            const scoreIcon = quiz.isAttempted ? getScoreIcon(quiz.score) : "📝";
            const status = getStatusBadge(quiz);

            return (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Quiz Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      #{quizzes.length - index}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize">{quiz.quizType} Quiz</h3>
                      <p className="text-sm text-gray-500">
                        {quiz.isAttempted ? formatDate(quiz.attemptedAt) : "Ready to attempt"}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl">{scoreIcon}</div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                    {status.icon} {status.text}
                  </span>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-4">
                  <div className={`relative w-20 h-20 rounded-full border-4 ${scoreColor} flex items-center justify-center`}>
                    <span className="text-2xl font-bold">
                      {quiz.isAttempted ? `${quiz.score}%` : "---"}
                    </span>
                  </div>
                </div>

                {/* Performance Text */}
                <div className="text-center mb-4">
                  <p className="font-semibold text-gray-700">{performance}</p>
                  <p className="text-sm text-gray-500">{quiz.totalQuestions} questions</p>
                </div>

                {/* Stats */}
                {quiz.isAttempted && (
                  <div className="grid grid-cols-2 gap-3 text-center mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-medium text-gray-600">Accuracy</div>
                      <div className="text-lg font-bold text-blue-600">{accuracy}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-sm font-medium text-gray-600">Correct</div>
                      <div className="text-lg font-bold text-green-600">
                        {quiz.answers?.filter(a => a.isCorrect).length || 0}/{quiz.totalQuestions}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuizClick(quiz)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAttemptQuiz(quiz)}
                    className={`flex-1 font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                      quiz.isAttempted
                        ? "bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
                        : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                    }`}
                  >
                    {quiz.isAttempted ? "Re-attempt" : "Attempt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready for Another Challenge?</h2>
          <p className="text-gray-600 mb-6">Create a new quiz and continue testing your knowledge!</p>
          <button
            onClick={handleNewQuiz}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Take New Quiz
          </button>
        </div>
      </div>

      {/* Quiz Details Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Quiz Details</h2>
                  <p className="text-purple-100">
                    {selectedQuiz.quizType.toUpperCase()} • {selectedQuiz.totalQuestions} Questions
                  </p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-white hover:text-purple-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Overall Performance */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {selectedQuiz.isAttempted ? `${selectedQuiz.score}%` : "---"}
                  </div>
                  <div className="text-sm text-green-700">Final Score</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">{selectedQuiz.totalQuestions}</div>
                  <div className="text-sm text-blue-700">Total Questions</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {selectedQuiz.isAttempted ? (selectedQuiz.answers?.filter(a => a.isCorrect).length || 0) : "---"}
                  </div>
                  <div className="text-sm text-purple-700">Correct Answers</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {selectedQuiz.isAttempted ? formatDate(selectedQuiz.attemptedAt) : "Not Attempted"}
                  </div>
                  <div className="text-sm text-orange-700">Status</div>
                </div>
              </div>

              {/* Question Review - Only show if attempted */}
              {selectedQuiz.isAttempted && selectedQuiz.answers && selectedQuiz.answers.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                  <div className="space-y-4">
                    {selectedQuiz.answers.map((answer, index) => (
                      <div
                        key={index}
                        className={`border-l-4 rounded-r-lg p-4 ${
                          answer.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">Q{index + 1}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              answer.isCorrect
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{answer.question}</p>
                        <div className="text-sm">
                          <p className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            <span className="font-medium">Your answer:</span> {answer.userAnswer || 'Not answered'}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-green-700">
                              <span className="font-medium">Correct answer:</span> {answer.correctAnswer}
                            </p>
                          )}
                        </div>
                        {answer.explanation && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">💡 Explanation:</span> {answer.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Not Attempted</h3>
                  <p className="text-gray-600">This quiz hasn't been attempted yet. Start your first attempt to see detailed results.</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseDetails}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAttemptQuiz(selectedQuiz)}
                  className={`flex-1 font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                    selectedQuiz.isAttempted
                      ? "bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
                      : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                  }`}
                >
                  {selectedQuiz.isAttempted ? "Re-attempt Quiz" : "Attempt Quiz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};