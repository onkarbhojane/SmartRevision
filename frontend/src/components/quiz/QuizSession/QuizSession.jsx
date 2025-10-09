import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../common/UI/Button/Button';
import axios from 'axios';
import './QuizSession.css';

export const QuizSession = ({ quiz, documentId, onComplete, documentTitle }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit || 1800); // 30 minutes default
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
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

    return () => clearInterval(timerRef.current);
  }, [quizStarted, timeLeft, showResults]);

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    if (!quizSubmitted) {
      handleSubmitQuiz();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const currentQ = quiz?.questions?.[currentQuestion] || quiz?.[currentQuestion];
  const totalQuestions = quiz?.questions?.length || quiz?.length || 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleAnswerSelect = (answerIndex) => {
    setUserAnswers(prev => ({ 
      ...prev, 
      [currentQ?.id || currentQuestion]: answerIndex 
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(prev => prev - 1);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    const questions = quiz.questions || quiz;
    let correct = 0;
    questions.forEach((q, index) => {
      const qid = q.id || index;
      if (userAnswers[qid] === q.correctAnswer) correct++;
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;
    
    setQuizSubmitted(true);
    setShowResults(true);
    clearInterval(timerRef.current);

    const score = calculateScore();
    const questions = quiz.questions || quiz;

    // Prepare quiz data for backend
    const quizData = {
      title: quiz.title || `Quiz for ${documentTitle}`,
      documentId: documentId,
      totalQuestions: totalQuestions,
      score: score,
      timeSpent: (quiz.timeLimit || 1800) - timeLeft,
      answers: questions.map((q, index) => {
        const qid = q.id || index;
        return {
          question: q.question,
          userAnswer: userAnswers[qid] ?? null,
          correctAnswer: q.correctAnswer,
          isCorrect: userAnswers[qid] === q.correctAnswer,
          options: q.options,
          explanation: q.explanation
        };
      })
    };

    // Save attempt to backend
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `https://smartrevision.onrender.com/api/quizzes/save/${documentId}`,
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

    onComplete?.(userAnswers);
  };

  // Quiz not started view
  if (!quizStarted) {
    return (
      <div className="quiz-intro-container">
        <div className="quiz-intro-card">
          <div className="quiz-header">
            <div className="quiz-icon">🎯</div>
            <h1 className="quiz-title">Ready for Your Quiz?</h1>
            <p className="quiz-subtitle">Test your knowledge from the document</p>
          </div>

          <div className="quiz-info-grid">
            <div className="info-item">
              <div className="info-icon">📄</div>
              <div className="info-content">
                <span className="info-label">Document</span>
                <span className="info-value">{documentTitle}</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">❓</div>
              <div className="info-content">
                <span className="info-label">Questions</span>
                <span className="info-value">{totalQuestions} questions</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">⏱️</div>
              <div className="info-content">
                <span className="info-label">Time Limit</span>
                <span className="info-value">{formatTime(quiz?.timeLimit || 1800)}</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">🎯</div>
              <div className="info-content">
                <span className="info-label">Passing Score</span>
                <span className="info-value">70% or higher</span>
              </div>
            </div>
          </div>

          <div className="quiz-instructions">
            <h3 className="instructions-title">Instructions</h3>
            <ul className="instructions-list">
              <li>• Read each question carefully before answering</li>
              <li>• You can navigate between questions using Previous/Next buttons</li>
              <li>• The quiz will auto-submit when time runs out</li>
              <li>• You'll see detailed explanations after submission</li>
              <li>• Your progress will be saved automatically</li>
            </ul>
          </div>

          <Button 
            onClick={startQuiz}
            className="start-quiz-btn"
            size="lg"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const score = calculateScore();
    const questions = quiz.questions || quiz;
    const correctAnswers = questions.filter((q, index) => {
      const qid = q.id || index;
      return userAnswers[qid] === q.correctAnswer;
    }).length;

    const getScoreColor = (score) => {
      if (score >= 90) return 'score-excellent';
      if (score >= 70) return 'score-good';
      if (score >= 50) return 'score-average';
      return 'score-poor';
    };

    const getScoreMessage = (score) => {
      if (score >= 90) return 'Outstanding! 🎉';
      if (score >= 70) return 'Great Job! 👍';
      if (score >= 50) return 'Good Effort! 💪';
      return 'Keep Practicing! 📚';
    };

    return (
      <div className="quiz-results-container">
        <div className="quiz-results-card">
          <div className="results-header">
            <div className={`score-circle ${getScoreColor(score)}`}>
              <span className="score-percent">{score}%</span>
              <span className="score-label">Score</span>
            </div>
            <div className="results-title">
              <h2>Quiz Complete!</h2>
              <p className="score-message">{getScoreMessage(score)}</p>
            </div>
          </div>

          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
              <span className="stat-label">Correct Answers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatTime((quiz.timeLimit || 1800) - timeLeft)}</span>
              <span className="stat-label">Time Taken</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round((correctAnswers / totalQuestions) * 100)}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>

          <div className="detailed-results">
            <h3 className="section-title">Question Review</h3>
            <div className="questions-review">
              {questions.map((q, index) => {
                const qid = q.id || index;
                const userAnswer = userAnswers[qid];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <div key={qid} className={`question-review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="question-header">
                      <div className="question-number">Q{index + 1}</div>
                      <div className={`status-badge ${isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    
                    <p className="question-text">{q.question}</p>
                    
                    <div className="answer-comparison">
                      <div className="answer-row">
                        <span className="answer-label">Your answer:</span>
                        <span className={`user-answer ${isCorrect ? 'text-correct' : 'text-incorrect'}`}>
                          {q.options ? q.options[userAnswer] || 'Not answered' : 'Not answered'}
                        </span>
                      </div>
                      
                      {!isCorrect && q.options && (
                        <div className="answer-row">
                          <span className="answer-label">Correct answer:</span>
                          <span className="correct-answer">{q.options[q.correctAnswer]}</span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="explanation">
                        <span className="explanation-icon">💡</span>
                        <span className="explanation-text">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="results-actions">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="action-btn"
            >
              Retry Quiz
            </Button>
            <Button 
              onClick={() => onComplete?.(userAnswers)}
              className="action-btn"
            >
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz view
  if (!currentQ) {
    return (
      <div className="quiz-error">
        <p>No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="quiz-session-container">
      <div className="quiz-header-bar">
        <div className="quiz-progress">
          <span className="progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="quiz-timer">
          <div className={`timer-display ${timeLeft < 60 ? 'timer-warning' : ''}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="question-card">
        <h2 className="question-title">{currentQ.question}</h2>
        
        {currentQ.options && (
          <div className="options-grid">
            {currentQ.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`option-card ${
                  userAnswers[currentQ.id || currentQuestion] === idx 
                    ? 'option-selected' 
                    : 'option-default'
                }`}
              >
                <div className="option-content">
                  <div className="option-marker">
                    <div className={`option-circle ${
                      userAnswers[currentQ.id || currentQuestion] === idx 
                        ? 'circle-selected' 
                        : 'circle-default'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                  </div>
                  <span className="option-text">{option}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navigation-controls">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="nav-btn"
        >
          ← Previous
        </Button>
        
        <div className="question-indicators">
          {Array.from({ length: totalQuestions }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`question-indicator ${
                index === currentQuestion 
                  ? 'indicator-current' 
                  : userAnswers[quiz.questions?.[index]?.id || index] !== undefined
                  ? 'indicator-answered'
                  : 'indicator-default'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentQ.options && userAnswers[currentQ.id || currentQuestion] === undefined}
          className="nav-btn"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next →'}
        </Button>
      </div>
    </div>
  );
};