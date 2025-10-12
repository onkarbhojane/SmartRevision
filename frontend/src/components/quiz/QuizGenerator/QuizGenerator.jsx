import React, { useState, useEffect } from 'react';
import { Button } from '../../common/UI/Button/Button';
import axios from 'axios';

const QUIZ_TYPES = [
  { id: 'mcq', name: 'Multiple Choice', icon: '🔘', description: 'Choose from options' },
  { id: 'saq', name: 'Short Answer', icon: '📝', description: 'Brief written answers' },
  { id: 'laq', name: 'Long Answer', icon: '📄', description: 'Detailed explanations' }
];

export const QuizGenerator = ({ documentId, onQuizGenerated, documentTitle, onViewAllQuizzes }) => {
  const [selectedType, setSelectedType] = useState('mcq');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Fetch past quiz attempts
  useEffect(() => {
    const fetchPastAttempts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `https://smartrevision.onrender.com/api/quizzes/attempts/${documentId}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setPastAttempts(response.data.attempts || []);
      } catch (error) {
        console.error('Failed to fetch past attempts:', error);
        setPastAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    };

    if (documentId) {
      fetchPastAttempts();
    }
  }, [documentId]);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `https://smartrevision.onrender.com/api/quizzes/generate/${documentId}`,
        {
          quizType: selectedType,
          numQuestions: questionCount
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      onQuizGenerated?.(response.data.quiz);
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleAttemptQuiz = (attemptId) => {
    window.open(`/quiz/${documentId}/${attemptId}`, '_blank');
  };

  const handleRetryAttempt = (attempt) => {
    handleGenerateQuiz();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200 text-green-800';
    if (score >= 70) return 'bg-blue-50 border-blue-200 text-blue-800';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-red-50 border-red-200 text-red-800';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return '🎉';
    if (score >= 70) return '👍';
    if (score >= 50) return '💪';
    return '📚';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Quiz Generator</h2>
        <p className="text-purple-100 text-sm mt-1">Create custom quizzes from your document</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Quiz Configuration Section */}
        <div className="flex-1">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Quiz</h3>
            
            {/* Quiz Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Quiz Type</label>
              <div className="grid gap-3">
                {QUIZ_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg text-left transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{type.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedType === type.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Number of Questions: <span className="text-purple-600 font-bold">{questionCount}</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>3</span>
                  <span>9</span>
                  <span>15</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateQuiz}
              loading={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Questions...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🎯</span>
                  Generate & Start Quiz
                </div>
              )}
            </Button>

            {/* View All Quizzes Button */}
            <Button
              onClick={onViewAllQuizzes}
              variant="outline"
              className="w-full py-3 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <span>📊</span>
              View All Quiz Attempts
            </Button>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h4 className="font-semibold text-blue-900">Pro Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Multiple Choice quizzes are great for quick knowledge checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Short Answer questions test recall and understanding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Long Answer questions help develop critical thinking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Start with 5-7 questions to get familiar with the format</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Attempts Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {pastAttempts.length} total
            </span>
          </div>

          {loadingAttempts ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading your quiz history...</p>
            </div>
          ) : pastAttempts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
              {pastAttempts.slice(0, 4).map((attempt, index) => (
                <div 
                  key={attempt._id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Score Circle */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs ${getScoreColor(attempt.score)}`}>
                      {attempt.score}%
                    </div>

                    {/* Attempt Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {attempt.quizType === 'mcq' ? 'MCQ' : attempt.quizType === 'saq' ? 'Short' : 'Long'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">{attempt.totalQuestions} questions</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {formatDate(attempt.attemptedAt)}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAttemptQuiz(attempt._id || attempt.attemptId)}
                          className="px-2 py-1 text-xs flex-1"
                        >
                          <span>▶️</span>
                          Attempt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-3xl mb-2 block opacity-50">📝</span>
              <p className="text-sm">No quiz attempts yet. Generate your first quiz!</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};