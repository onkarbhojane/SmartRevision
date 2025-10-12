import express from "express";
import {
  generateQuiz,
  saveQuizAttempt,
  getLatestQuiz,
  getAllQuizzes,
  getAllQuizzesNum,
  getDashboardData
} from "../controllers/quiz.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard", authMiddleware, getDashboardData);
router.get("/allquiz", authMiddleware, getAllQuizzesNum);

// Quiz management routes
router.post("/generate/:documentId", authMiddleware, generateQuiz);
router.get("/latest/:documentId", authMiddleware, getLatestQuiz);
router.post("/save/:documentId/:quizId", authMiddleware, saveQuizAttempt);
router.get("/allquiz/:documentId", authMiddleware, getAllQuizzes);



export default router;