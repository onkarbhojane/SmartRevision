import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { motion } from "framer-motion";
import axios from "axios";
export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          "http://localhost:5000/api/quizzes/dashboard",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const data = response;

        setDashboardData(data.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to minimal data structure if API fails
        setDashboardData({
          user: { name: user?.name || "Student" },
          stats: {
            totalQuizzesAttempted: 0,
            averageScore: 0,
            totalStudyMaterials: 0,
            totalChatSessions: 0,
            strengths: [],
            weaknesses: [],
          },
          study_materials: [],
          recentActivities: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const stats = [
    {
      name: "Quizzes Completed",
      value: dashboardData?.stats?.totalQuizzesAttempted?.toString() || "0",
      change: "+0",
      changeType: "positive",
      icon: "📊",
      description: "Total quizzes taken",
      color: "blue",
    },
    {
      name: "Average Score",
      value: dashboardData?.stats?.averageScore
        ? `${dashboardData.stats.averageScore}%`
        : "0%",
      change: "+0%",
      changeType: "positive",
      icon: "🎯",
      description: "Overall performance",
      color: "green",
    },
    {
      name: "Study Materials",
      value: dashboardData?.stats?.totalStudyMaterials?.toString() || "0",
      change: dashboardData?.stats?.totalStudyMaterials > 0 ? "+1" : "+0",
      changeType: "positive",
      icon: "📚",
      description: "Uploaded documents",
      color: "purple",
    },
    {
      name: "AI Sessions",
      value: dashboardData?.stats?.totalChatSessions?.toString() || "0",
      change: dashboardData?.stats?.totalChatSessions > 0 ? "+1" : "+0",
      changeType: "positive",
      icon: "🤖",
      description: "Chat sessions",
      color: "orange",
    },
  ];

  const recentActivities =
    dashboardData?.recentActivities?.length > 0
      ? dashboardData.recentActivities.slice(0, 4)
      : [
          {
            id: 1,
            type: "quiz",
            title: "No recent activity",
            score: "0%",
            time: "Get started!",
          },
          {
            id: 2,
            type: "document",
            title: "Upload your first document",
            time: "Click to begin",
          },
        ];

  const quickActions = [
    {
      title: "Start New Study Session",
      description: "Continue with your documents",
      icon: "📚",
      link: "/documents",
    },
    {
      title: "Generate Quiz",
      description: "Test your knowledge",
      icon: "🎯",
      link:
        dashboardData?.study_materials?.length > 0
          ? "/study?tab=quiz"
          : "/documents",
    },
    {
      title: "View Progress",
      description: "Check your learning analytics",
      icon: "📈",
      link: "/progress",
    },
  ];

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        hover: "hover:bg-blue-200 dark:hover:bg-blue-800/40",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        hover: "hover:bg-green-200 dark:hover:bg-green-800/40",
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-600 dark:text-purple-400",
        hover: "hover:bg-purple-200 dark:hover:bg-purple-800/40",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400",
        hover: "hover:bg-orange-200 dark:hover:bg-orange-800/40",
      },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {dashboardData?.user?.name || user?.name || "Student"}!
          👋
        </h1>
        <p className="text-blue-100 text-lg">
          {dashboardData?.study_materials?.length > 0
            ? "Ready to continue your learning journey? You're making great progress!"
            : "Get started by uploading your first study material!"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.bg}`}
                >
                  <span className="text-xl">{stat.icon}</span>
                </div>
              </div>
              <div
                className={`inline-flex items-center text-sm font-medium mt-2 ${
                  stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.changeType === "positive" ? "↑" : "↓"} {stat.change}
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  from last week
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const colorClasses = getColorClasses("blue");
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={action.link}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${colorClasses.bg} ${colorClasses.hover}`}
                    >
                      <span className="text-xl">{action.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              to="/progress"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const activityColors = {
                quiz: getColorClasses("green"),
                document: getColorClasses("blue"),
                chat: getColorClasses("purple"),
              };
              const colorClass =
                activityColors[activity.type] || activityColors.quiz;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass.bg}`}
                  >
                    <span className="text-sm">
                      {activity.type === "quiz"
                        ? "🎯"
                        : activity.type === "document"
                          ? "📄"
                          : "🤖"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.time).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.score && (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-sm font-medium">
                      {activity.score}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recommended for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {dashboardData?.study_materials?.length > 0
                ? "Continue Studying"
                : "Start Studying"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {dashboardData?.study_materials?.length > 0
                ? `You have ${dashboardData.study_materials.length} study material${dashboardData.study_materials.length > 1 ? "s" : ""}`
                : "Upload your first document to begin"}
            </p>
            <Link
              to={dashboardData?.study_materials?.length > 0 ? `/study/${dashboardData.study_materials[0]?._id}`: "/documents"}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-block text-center"
            >
              {dashboardData?.study_materials?.length > 0
                ? "Resume Study"
                : "Get Started"}
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-green-500 dark:hover:border-green-400 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Practice Quiz
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {dashboardData?.study_materials?.length > 0
                ? "Test your knowledge on your materials"
                : "Upload documents to generate quizzes"}
            </p>
            <Link
              to={
                dashboardData?.study_materials?.length > 0
                  ? "/documents"
                  : "/documents"
              }
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors inline-block text-center"
            >
              {dashboardData?.study_materials?.length > 0
                ? "Start Quiz"
                : "Upload First"}
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📈</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Focus Areas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {dashboardData?.stats?.weaknesses?.length > 0
                ? `Focus on ${dashboardData.stats.weaknesses.slice(0, 2).join(" and ")}`
                : "Complete quizzes to identify weak areas"}
            </p>
            <Link
              to="/progress"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors inline-block text-center"
            >
              Review Progress
            </Link>
          </motion.div>
        </div>
      </div>

      {/* User Study Materials Preview */}
      {dashboardData?.study_materials &&
        dashboardData.study_materials.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Study Materials
              </h2>
              <Link
                to="/documents"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.study_materials
                .slice(0, 3)
                .map((material, index) => (
                  <motion.div
                    key={material._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        PDF
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Uploaded{" "}
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/study/${material._id}`}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors inline-block text-center"
                    >
                      Study Now
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};
