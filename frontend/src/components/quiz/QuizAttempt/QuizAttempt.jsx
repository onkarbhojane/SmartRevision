import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../common/UI/Button/Button';
import axios from 'axios';

export const QuizAttempt = () => {
  const { documentId, attemptId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const timerRef = useRef(null);

  // Enhanced quiz data fetching
  useEffect(() => {
    const fetchQuizData = async () => {
      console.log('Fetching quiz data...');
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        // Fetch document info
        const docResponse = await axios.get(
          `https://smartrevision.onrender.com/api/study/documents/${documentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocumentInfo(docResponse.data.document);

        let quizData;

        if (attemptId) {
          console.log('Fetching existing quiz attempt...', attemptId);
          const response = await axios.get(
            `https://smartrevision.onrender.com/api/quizzes/allquiz/${documentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const quizzes = response.data.quizzes || [];
          const existingQuiz = quizzes.find(q => q._id === attemptId);
          
          if (existingQuiz) {
            console.log('Found existing quiz:', existingQuiz);
            
            // For reattempt, check if there are existing user answers to pre-fill
            const userAnswersObj = {};
            if (existingQuiz.answers && existingQuiz.isAttempted) {
              existingQuiz.answers.forEach((answer, index) => {
                if (answer.userAnswer && answer.userAnswer.trim() !== '') {
                  // Based on quizType, store the answer appropriately
                  if (existingQuiz.quizType === 'mcq') {
                    // For MCQ, find the index of the selected option
                    const selectedIndex = answer.options?.indexOf(answer.userAnswer);
                    if (selectedIndex !== -1) {
                      userAnswersObj[index] = { type: 'mcq', value: selectedIndex };
                    }
                  } else {
                    // For SAQ/LAQ, store the text directly
                    userAnswersObj[index] = { 
                      type: existingQuiz.quizType, 
                      value: answer.userAnswer 
                    };
                  }
                }
              });
            }
            
            setUserAnswers(userAnswersObj);
            
            quizData = {
              _id: existingQuiz._id,
              quizType: existingQuiz.quizType,
              questions: existingQuiz.answers.map((answer, index) => ({
                id: index,
                question: answer.question,
                questionType: existingQuiz.quizType, // Use quizType for all questions
                options: answer.options || [],
                correctAnswer: answer.correctAnswer || '',
                explanation: answer.explanation,
                userAnswer: answer.userAnswer || ''
              })),
              title: `${existingQuiz.quizType.toUpperCase()} Quiz - ${existingQuiz.isAttempted ? 'Reattempt' : 'Continue'}`,
              isAttempted: existingQuiz.isAttempted
            };
          }
        }

        // If no existing quiz found or no attemptId, generate new quiz
        if (!quizData) {
          console.log('Generating new quiz...');
          const response = await axios.post(
            `https://smartrevision.onrender.com/api/quizzes/generate/${documentId}`,
            {
              quizType: 'mcq', // Default to MCQ if not specified
              numQuestions: 10
            },
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              } 
            }
          );
          
          quizData = response.data.quiz;
          console.log('Generated new quiz:', quizData);
          // Transform the quiz data to match our frontend structure
          if (quizData && quizData.answers) {
            quizData.questions = quizData.answers.map((answer, index) => ({
              id: index,
              question: answer.question,
              questionType: quizData.quizType, // Use the quiz's quizType for all questions
              options: answer.options || [],
              correctAnswer: answer.correctAnswer || '',
              explanation: answer.explanation,
              userAnswer: ''
            }));
          }
        }

        setQuiz(quizData);
        
        // Calculate total quiz time (2 minutes per question)
        const totalTime = (quizData.questions?.length || 0) * 120; // 2 minutes per question
        setTimeLeft(totalTime);

      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [documentId, attemptId]);

  // Handle browser navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (quizStarted && !showResults && !quizSubmitted) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your quiz progress will be submitted.';
        return event.returnValue;
      }
    };

    const handlePopState = (event) => {
      if (quizStarted && !showResults && !quizSubmitted) {
        event.preventDefault();
        setShowNavigationModal(true);
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizStarted, showResults, quizSubmitted]);

  // Total quiz timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [quizStarted, timeLeft, showResults, quizSubmitted]);

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    handleSubmitConfirm();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const currentQ = quiz?.questions?.[currentQuestion];
  const totalQuestions = quiz?.questions?.length || 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Get the actual question type based on quiz type
  const getActualQuestionType = () => {
    if (!quiz || !quiz.quizType) return 'multiple-choice';
    
    switch (quiz.quizType) {
      case 'mcq':
        return 'multiple-choice';
      case 'saq':
        return 'short-answer';
      case 'laq':
        return 'long-answer';
      default:
        return 'multiple-choice';
    }
  };

  const actualQuestionType = getActualQuestionType();

  const handleAnswerSelect = (answerIndex) => {
    if (actualQuestionType === 'multiple-choice') {
      setUserAnswers(prev => ({ 
        ...prev, 
        [currentQuestion]: { type: 'mcq', value: answerIndex }
      }));
    }
  };

  const handleTextAnswerChange = (text) => {
    if (actualQuestionType === 'short-answer' || actualQuestionType === 'long-answer') {
      setUserAnswers(prev => ({ 
        ...prev, 
        [currentQuestion]: { 
          type: actualQuestionType, 
          value: text 
        }
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmitConfirm();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(prev => prev - 1);
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      
      if (userAnswer) {
        if (actualQuestionType === 'multiple-choice') {
          if (userAnswer.value === q.options?.indexOf(q.correctAnswer)) {
            correct++;
          }
        } else {
          // For text answers, compare directly (case insensitive)
          if (userAnswer.value?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()) {
            correct++;
          }
        }
      }
    });
    
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleSubmitConfirm = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;
    
    setQuizSubmitted(true);
    setShowResults(true);
    setShowSubmitModal(false);
    setShowNavigationModal(false);
    clearInterval(timerRef.current);

    const score = calculateScore();

    // Prepare quiz data for backend
    const answers = quiz.questions.map((q, index) => {
      const userAnswer = userAnswers[index];
      let userAnswerText = '';
      let isCorrect = false;

      if (userAnswer) {
        if (actualQuestionType === 'multiple-choice') {
          userAnswerText = q.options?.[userAnswer.value] || '';
          isCorrect = userAnswer.value === q.options?.indexOf(q.correctAnswer);
        } else {
          // For short-answer and long-answer questions
          userAnswerText = userAnswer.value || '';
          isCorrect = userAnswerText.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
        }
      }

      return {
        question: q.question,
        questionType: actualQuestionType, // Use the actual question type
        options: q.options || [],
        userAnswer: userAnswerText,
        correctAnswer: q.correctAnswer || '',
        isCorrect: isCorrect,
        explanation: q.explanation
      };
    });

    const quizData = {
      answers: answers,
      score: score,
      isAttempted: true,
      quizType: quiz.quizType, // Keep the original quiz type
      totalQuestions: totalQuestions
    };

    // Save attempt to backend
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `https://smartrevision.onrender.com/api/quizzes/save/${documentId}/${quiz._id}`,
        quizData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Quiz results saved successfully');
    } catch (err) {
      console.error('Failed to save quiz attempt:', err);
    }
  };

  const handleExitConfirm = () => {
    setShowExitModal(true);
  };

  const handleExitQuiz = () => {
    if (quizStarted && !quizSubmitted) {
      handleSubmitQuiz();
    }
    navigate(-1);
  };

  const handleNavigationConfirm = () => {
    handleSubmitQuiz();
  };

  const handleNavigationCancel = () => {
    setShowNavigationModal(false);
  };

  // Calculate question type statistics - now based on quiz type
  const getQuestionTypeStats = () => {
    if (!quiz?.questions) return {};
    
    const stats = {
      'multiple-choice': 0,
      'short-answer': 0,
      'long-answer': 0
    };
    
    // All questions have the same type based on quiz type
    const questionType = getActualQuestionType();
    if (stats.hasOwnProperty(questionType)) {
      stats[questionType] = totalQuestions;
    }
    
    return stats;
  };

  // UI helper functions
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    if (score >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding! 🏆';
    if (score >= 80) return 'Excellent Work! ⭐';
    if (score >= 70) return 'Great Job! 👍';
    if (score >= 60) return 'Good Effort! 💪';
    if (score >= 50) return 'Not Bad! 📚';
    return 'Keep Practicing! 🎯';
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple-choice': return '🔘';
      case 'short-answer': return '📝';
      case 'long-answer': return '📄';
      default: return '❓';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'multiple-choice': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'short-answer': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'long-answer': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeColor = (timeLeft) => {
    const totalTime = totalQuestions * 120; // 2 minutes per question
    if (timeLeft <= totalTime * 0.2) return 'text-red-600 bg-red-100 border-red-300';
    if (timeLeft <= totalTime * 0.4) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-green-600 bg-green-100 border-green-300';
  };

  // Get display name for quiz type
  const getQuizTypeDisplayName = () => {
    if (!quiz?.quizType) return 'Mixed';
    
    switch (quiz.quizType) {
      case 'mcq': return 'Multiple Choice';
      case 'saq': return 'Short Answer';
      case 'laq': return 'Long Answer';
      default: return quiz.quizType.toUpperCase();
    }
  };

  // Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
              >
                {cancelText || 'Cancel'}
              </Button>
              <Button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                {confirmText || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation Confirmation Modal
  const NavigationConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    const answeredQuestions = Object.keys(userAnswers).length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-3">🚨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Quiz?</h3>
            <p className="text-gray-600 mb-4">
              Your quiz will be submitted automatically with {answeredQuestions} answered questions.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
              >
                Continue Quiz
              </Button>
              <Button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Submit & Leave
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Preparing Your Quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Available</h2>
          <p className="text-gray-600 mb-6">
            {!quiz ? 'Unable to load quiz data.' : 'No questions available for this quiz.'}
          </p>
          <Button 
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            ← Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Quiz not started view
  if (!quizStarted) {
    const answeredQuestions = Object.keys(userAnswers).length;
    const isResuming = attemptId && answeredQuestions > 0;
    const questionStats = getQuestionTypeStats();
    const totalTime = totalQuestions * 120;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h1 className="text-3xl font-bold mb-2">
                {getQuizTypeDisplayName()} Quiz
              </h1>
              <p className="text-purple-100">Test your understanding and boost your skills</p>
            </div>

            <div className="p-6">
              {/* Document Info */}
              {documentInfo && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl text-purple-600">📚</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{documentInfo.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {documentInfo.category && `${documentInfo.category} • `}
                        Uploaded {new Date(documentInfo.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                
                <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatTime(totalTime)}</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                
                <div className="bg-white border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">70%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>

                <div className="bg-white border border-orange-200 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-orange-600">{getQuizTypeDisplayName()}</div>
                  <div className="text-sm text-gray-600">Quiz Type</div>
                </div>
              </div>

              {/* Question Type Breakdown */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  Question Type
                </h3>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 inline-block border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">{totalQuestions}</div>
                    <div className="text-lg text-blue-600 font-medium">{getQuizTypeDisplayName()} Questions</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <span>📋</span>
                  Instructions
                </h3>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• Total time: {formatTime(totalTime)} for all questions</li>
                  <li>• Navigate freely between questions</li>
                  <li>• Answers auto-save as you progress</li>
                  {actualQuestionType === 'multiple-choice' && <li>• Select one option for each question</li>}
                  {actualQuestionType === 'short-answer' && <li>• Provide concise answers for each question</li>}
                  {actualQuestionType === 'long-answer' && <li>• Provide detailed explanations for each question</li>}
                  <li>• Submit when you're ready to finish</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleExitConfirm}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  ← Back to Documents
                </Button>
                <Button 
                  onClick={startQuiz}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isResuming ? '🚀 Continue Quiz' : '🎯 Start Quiz'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const score = calculateScore();
    const correctAnswers = quiz.questions.filter((q, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        if (actualQuestionType === 'multiple-choice') {
          return userAnswer.value === q.options?.indexOf(q.correctAnswer);
        } else {
          return userAnswer.value?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
        }
      }
      return false;
    }).length;

    const unansweredQuestions = totalQuestions - Object.keys(userAnswers).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Results Header */}
            <div className={`bg-gradient-to-r ${getScoreColor(score)} text-white p-8 text-center`}>
              <div className="w-32 h-32 rounded-full border-4 border-white border-opacity-30 flex flex-col items-center justify-center font-bold mx-auto bg-white bg-opacity-10 backdrop-blur-sm">
                <span className="text-3xl">{score}%</span>
                <span className="text-sm mt-1 text-white text-opacity-90">Score</span>
              </div>
              <h2 className="text-3xl font-bold mt-4 mb-2">Quiz Complete! 🎉</h2>
              <p className="text-xl text-white text-opacity-90">{getScoreMessage(score)}</p>
            </div>

            <div className="p-6">
              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">{correctAnswers}/{totalQuestions}</div>
                  <div className="text-green-700 font-medium">Correct</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">{Object.keys(userAnswers).length}/{totalQuestions}</div>
                  <div className="text-blue-700 font-medium">Attempted</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">{score}%</div>
                  <div className="text-purple-700 font-medium">Final Score</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 font-medium"
                >
                  🔄 Retry Quiz
                </Button>
                <Button 
                  onClick={() => navigate(`/study/${documentId}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  📚 Back to Study
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz view
  const currentUserAnswer = userAnswers[currentQuestion];
  const answeredQuestions = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitQuiz}
        title="Submit Quiz?"
        message={`You have answered ${answeredQuestions} out of ${totalQuestions} questions. Are you sure you want to submit?`}
        confirmText="Submit Quiz"
        cancelText="Continue"
      />

      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitQuiz}
        title="Leave Quiz?"
        message="Your progress will be saved and submitted automatically."
        confirmText="Leave Quiz"
        cancelText="Stay"
      />

      <NavigationConfirmationModal
        isOpen={showNavigationModal}
        onCancel={handleNavigationCancel}
        onConfirm={handleNavigationConfirm}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Question Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sticky top-6">
              {/* Timer */}
              <div className={`rounded-xl p-3 text-center mb-4 border ${getTimeColor(timeLeft)}`}>
                <div className="text-xl font-bold font-mono">{formatTime(timeLeft)}</div>
                <div className="text-sm font-medium">Time Remaining</div>
                {timeLeft < 300 && (
                  <div className="text-xs text-red-600 mt-1 font-medium animate-pulse">
                    Time running out! ⚡
                  </div>
                )}
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: totalQuestions }, (_, index) => {
                  const isAnswered = userAnswers[index] !== undefined;
                  const isCurrent = index === currentQuestion;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all ${
                        isCurrent 
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-110' 
                          : isAnswered
                          ? 'bg-green-500 border-green-500 text-white hover:border-green-600'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress:</span>
                  <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleExitConfirm}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  🏃 Exit Quiz
                </Button>
                <Button
                  onClick={handleSubmitConfirm}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm"
                >
                  🎯 Submit Quiz
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">
                      Question {currentQuestion + 1} of {totalQuestions}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    Q{currentQuestion + 1}
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(actualQuestionType)}`}>
                      {getQuestionTypeIcon(actualQuestionType)} {actualQuestionType.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {currentQ.question}
              </h2>
              
              {/* Answer Input */}
              {actualQuestionType === 'multiple-choice' && currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = currentUserAnswer?.type === 'mcq' && currentUserAnswer.value === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            isSelected 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-gray-800 flex-1 font-medium">{option}</span>
                          {isSelected && (
                            <div className="text-purple-600 text-sm bg-purple-100 px-2 py-1 rounded border border-purple-300">
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (actualQuestionType === 'short-answer' || actualQuestionType === 'long-answer') ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <label className="block font-medium text-gray-700 mb-2">
                      {actualQuestionType === 'short-answer' ? '📝 Your Answer' : '📄 Detailed Answer'}
                    </label>
                    <textarea
                      value={currentUserAnswer?.type === actualQuestionType ? currentUserAnswer.value : ''}
                      onChange={(e) => handleTextAnswerChange(e.target.value)}
                      placeholder={actualQuestionType === 'short-answer' 
                        ? 'Type your brief answer here...' 
                        : 'Provide a detailed explanation...'}
                      className={`w-full p-3 border border-blue-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none font-medium ${
                        actualQuestionType === 'short-answer' ? 'h-32' : 'h-48'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>💡 Be clear and specific</span>
                      <span>{currentUserAnswer?.value?.length || 0} characters</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-yellow-800 font-medium">No answer format available for this question type.</p>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Previous
              </Button>

              <Button
                onClick={handleNext}
                className={`font-medium ${
                  isLastQuestion
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isLastQuestion ? '🎯 Submit Quiz' : 'Next Question →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};