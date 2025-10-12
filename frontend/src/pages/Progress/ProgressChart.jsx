import React from 'react';
import { motion } from 'framer-motion';

export const ProgressChart = ({ 
  totalQuizzes, 
  averageScore, 
  weakAreasCount, 
  studyHours,
  monthlyProgress = [] 
}) => {
  
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressBg = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getProgressWidth = (value, max) => {
    return Math.min((value / max) * 100, 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm"
        >
          <div className="text-2xl font-bold text-blue-600">{totalQuizzes}</div>
          <div className="text-sm text-blue-600 font-medium">Total Quizzes</div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-sm"
        >
          <div className="text-2xl font-bold text-green-600">{averageScore}%</div>
          <div className="text-sm text-green-600 font-medium">Average Score</div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm"
        >
          <div className="text-2xl font-bold text-purple-600">{studyHours}h</div>
          <div className="text-sm text-purple-600 font-medium">Study Hours</div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm"
        >
          <div className="text-2xl font-bold text-orange-600">{weakAreasCount}</div>
          <div className="text-sm text-orange-600 font-medium">Areas to Improve</div>
        </motion.div>
      </div>

      {/* Progress Bars */}
      <motion.div 
        variants={containerVariants}
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Completion</span>
            <span className="text-sm font-bold text-blue-600">{totalQuizzes} quizzes</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getProgressWidth(totalQuizzes, 50)}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-sm"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Score</span>
            <span className={`text-sm font-bold ${getProgressColor(averageScore)}`}>{averageScore}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${averageScore}%` }}
              transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
              className={`h-3 rounded-full shadow-sm ${getProgressBg(averageScore)}`}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Consistency</span>
            <span className="text-sm font-bold text-purple-600">{studyHours}h</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getProgressWidth(studyHours, 20)}%` }}
              transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full shadow-sm"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Monthly Progress Mini View */}
      {monthlyProgress.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="mt-6"
        >
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Monthly Trend</h4>
          <div className="flex items-end justify-between space-x-1 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            {monthlyProgress.slice(0, 6).map((month, index) => (
              <div key={month.month} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(month.averageScore / 100) * 40}px` }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                  className={`w-full rounded-t-lg ${
                    month.averageScore >= 80 ? 'bg-emerald-500' :
                    month.averageScore >= 60 ? 'bg-blue-500' :
                    month.averageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  } shadow-sm`}
                  title={`${month.month}: ${month.averageScore}%`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {month.month.split(' ')[0].slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};