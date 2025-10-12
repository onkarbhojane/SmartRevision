import User from "../models/user.model.js";
import { generateQuizService } from "../services/quizService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
/**
 * 🧠 Helper: Format quiz questions based on type
 */
const formatQuizData = (quizType, quizArray) => {
  return quizArray.map((q) => {
    const base = {
      question: q.question,
      userAnswer: "",
      isCorrect: false,
      explanation: q.explanation || "",
    };

    if (quizType === "mcq") {
      return {
        ...base,
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
      };
    } else {
      // SAQ or LAQ (no options)
      return {
        ...base,
        correctAnswer: q.correctAnswer || "",
      };
    }
  });
};

/**
 * Get total number of quizzes for dashboard
 */
export const getAllQuizzesNum = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const numQuizzes = user.study_materials.reduce((total, pdf) => {
      return total + (pdf.quizzes?.length || 0);
    }, 0);

    res.status(200).json({
      message: "Number of quizzes fetched successfully",
      numQuizzes,
    });
  } catch (err) {
    console.error("❌ getAllQuizzesNum error:", err);
    res.status(500).json({
      message: "Failed to fetch number of quizzes",
      error: err.message,
    });
  }
};

/**
 * Get comprehensive dashboard data
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize stats
    let totalQuizzesAttempted = 0;
    let totalScore = 0;
    const totalStudyMaterials = user.study_materials.length;
    let totalChatSessions = 0;
    const recentActivities = [];

    // 🧩 Extract strengths & weaknesses from progress
    const strengths = user.progress?.strengths || [];
    const weaknesses = user.progress?.weaknesses || [];

    // Process each study material
    user.study_materials.forEach((material) => {
      totalChatSessions += material.chat_sessions?.length || 0;

      // Process quizzes
      material.quizzes?.forEach((quiz) => {
        if (quiz.isAttempted) {
          totalQuizzesAttempted++;
          totalScore += quiz.score || 0;

          // Add to activity log
          recentActivities.push({
            id: quiz._id,
            type: "quiz",
            title: `Quiz: ${material.title}`,
            score: `${quiz.score}%`,
            time: quiz.attemptedAt,
            documentId: material._id,
          });
        }
      });

      // Document upload activity
      recentActivities.push({
        id: material._id,
        type: "document",
        title: `Uploaded: ${material.title}`,
        time: material.uploadedAt,
      });

      // Chat session activities
      material.chat_sessions?.forEach((session) => {
        recentActivities.push({
          id: session._id,
          type: "chat",
          title: "AI Tutor Session",
          time: session.messages?.[0]?.timestamp || new Date(),
        });
      });
    });

    // Calculate average score
    const averageScore =
      totalQuizzesAttempted > 0
        ? Math.round(totalScore / totalQuizzesAttempted)
        : 0;

    // Sort recent activities (latest first)
    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    // ✅ Send response with strengths & weaknesses
    res.status(200).json({
      message: "✅ Dashboard data fetched successfully",
      data: {
        user: {
          name: user.name,
          email: user.email_id,
        },
        stats: {
          totalQuizzesAttempted,
          averageScore,
          totalStudyMaterials,
          totalChatSessions,
          strengths,
          weaknesses,
        },
        study_materials: user.study_materials,
        recentActivities: sortedActivities,
      },
    });
  } catch (err) {
    console.error("❌ getDashboardData error:", err);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: err.message,
    });
  }
};

/**
 * 1️⃣ Get the latest quiz for a specific PDF
 */
export const getLatestQuiz = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pdf = user.study_materials.id(documentId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const latestQuiz = pdf.quizzes?.[0] || null;
    if (!latestQuiz)
      return res.status(404).json({ message: "No quiz found for this PDF" });

    res.status(200).json({
      message: "Latest quiz fetched successfully",
      quiz: latestQuiz,
    });
  } catch (err) {
    console.error("❌ getLatestQuiz error:", err);
    res.status(500).json({
      message: "Failed to fetch latest quiz",
      error: err.message,
    });
  }
};

/**
 * 2️⃣ Generate a new quiz (MCQ, SAQ, or LAQ)
 */
export const generateQuiz = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { quizType = "mcq", numQuestions = 5 } = req.body;
    const userId = req.user.id;

    // Generate quiz content using your service
    const quizData = await generateQuizService(
      userId,
      documentId,
      quizType,
      numQuestions
    );

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pdf = user.study_materials.id(documentId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    // Create formatted quiz object
    const newQuiz = {
      quizType,
      totalQuestions: quizData.length,
      score: 0,
      isAttempted: false,
      answers: formatQuizData(quizType, quizData),
      attemptedAt: new Date(),
    };

    // ✅ Push new quiz into existing array instead of replacing
    pdf.quizzes.push(newQuiz);
    await user.save();

    console.log("✅ Quiz generated successfully", newQuiz);
    res.status(200).json({
      message: `${quizType.toUpperCase()} quiz generated successfully`,
      quiz: newQuiz,
    });
  } catch (err) {
    console.error("❌ generateQuiz error:", err);
    res.status(500).json({
      message: "Quiz generation failed",
      error: err.message,
    });
  }
};

/**
 * 3️⃣ Save or update a quiz attempt
 */
export const saveQuizAttempt = async (req, res) => {
  try {
    const { documentId, quizId } = req.params;
    const { answers, score } = req.body;
    const userId = req.user.id;

    if (!answers || (typeof score !== "number" && answers.length === 0)) {
      return res.status(400).json({ message: "Invalid answers or score" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pdf = user.study_materials.id(documentId);
    if (!pdf) return res.status(404).json({ message: "Document not found" });

    const quiz = pdf.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let strengthsArr = [];
    let weaknessesArr = [];

    if (quiz.quizType === "saq" || quiz.quizType === "laq") {
      console.log(
        `🔍 Evaluating ${quiz.quizType.toUpperCase()} answers using Gemini...`
      );

      for (let i = 0; i < answers.length; i++) {
        const userAnswer = answers[i].userAnswer?.trim();
        const correctAnswer = quiz.answers[i].correctAnswer?.trim();

        if (!userAnswer) continue;

        const prompt = `
Evaluate the student's answer for a ${quiz.quizType.toUpperCase()} question.

Question: "${quiz.answers[i].question}"
Expected Answer: "${correctAnswer}"
Student's Answer: "${userAnswer}"

Respond ONLY in JSON:
{
  "isCorrect": true or false,
  "similarity": a number from 0 to 100,
  "feedback": "short feedback to student",
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"]
}
        `;

        try {
          const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          const text = response.response.text();
          const match = text.match(/\{[\s\S]*\}/);
          const aiResponse = match ? JSON.parse(match[0]) : null;

          if (aiResponse) {
            answers[i].isCorrect = aiResponse.isCorrect;
            answers[i].feedback = aiResponse.feedback;
            answers[i].similarity = aiResponse.similarity;

            if (Array.isArray(aiResponse.strengths))
              strengthsArr.push(...aiResponse.strengths);
            if (Array.isArray(aiResponse.weaknesses))
              weaknessesArr.push(...aiResponse.weaknesses);
          } else {
            answers[i].isCorrect = false;
            answers[i].feedback = "Could not evaluate with AI.";
            answers[i].similarity = 0;
          }
        } catch (e) {
          console.error(
            `⚠️ Gemini evaluation failed for question ${i + 1}:`,
            e.message
          );
          answers[i].isCorrect = false;
          answers[i].feedback = "Evaluation error.";
          answers[i].similarity = 0;
        }
      }

      // Recalculate score for SAQ/LAQ
      const correctCount = answers.filter((a) => a.isCorrect).length;
      quiz.score = Math.round((correctCount / answers.length) * 100);
    } else {
      // For MCQ, use provided score
      quiz.score = score;

      // Generate strengths/weaknesses based on correct/incorrect answers
      answers.forEach((a) => {
        if (a.isCorrect) strengthsArr.push(a.question);
        else weaknessesArr.push(a.question);
      });
    }

    // ✅ Update quiz answers and metadata
    quiz.answers = answers.map((a) => ({
      ...a,
      isAttempted: true,
    }));
    quiz.attemptedAt = new Date();
    quiz.isAttempted = true;

    // ✅ Update user progress
    const totalPrevQuizzes = user.progress.totalQuizzes || 0;
    const prevAvg = user.progress.averageScore || 0;
    const newTotal = totalPrevQuizzes + 1;
    const newAvg = (prevAvg * totalPrevQuizzes + quiz.score) / newTotal;

    user.progress.totalQuizzes = newTotal;
    user.progress.averageScore = parseFloat(newAvg.toFixed(2));

    // ✅ Push unique strengths and weaknesses
    user.progress.strengths = Array.from(
      new Set([...(user.progress.strengths || []), ...strengthsArr])
    );
    user.progress.weaknesses = Array.from(
      new Set([...(user.progress.weaknesses || []), ...weaknessesArr])
    );

    console.log("✅ Quiz saved and progress updated with strengths/weaknesses");
    await user.save();

    return res.status(200).json({
      message: "✅ Quiz attempt saved and evaluated successfully",
      quiz,
      progress: user.progress,
    });
  } catch (err) {
    console.error("❌ saveQuizAttempt error:", err);
    return res.status(500).json({
      message: "Saving quiz attempt failed",
      error: err.message,
    });
  }
};

/**
 * 4️⃣ Get all quizzes for a specific document
 */
export const getAllQuizzes = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const pdf = user.study_materials.id(documentId);
    if (!pdf) return res.status(404).json({ msg: "PDF not found" });

    const quizzes = pdf.quizzes || [];

    res.status(200).json({
      msg: "Quizzes fetched successfully",
      quizzes,
    });
  } catch (error) {
    console.error("❌ Error fetching all quizzes:", error);
    res.status(500).json({
      msg: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};
