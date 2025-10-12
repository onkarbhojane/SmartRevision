import mongoose from "mongoose";

const { Schema } = mongoose;

/* ---------------------- Question Schema ---------------------- */
const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["single-choice", "multiple-correct", "short-answer"],
    default: "single-choice",
  },
  // ✅ Only present for choice-based questions
  options: [
    {
      type: String,
      required: function () {
        return (
          this.questionType === "single-choice" ||
          this.questionType === "multiple-correct"
        );
      },
    },
  ],
  // ✅ User’s answer - can be string or array
  userAnswer: {
    type: Schema.Types.Mixed,
    default: "",
  },
  // ✅ Correct answer - can be string or array
  correctAnswer: {
    type: Schema.Types.Mixed,
    default: "",
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  explanation: {
    type: String,
    default: "",
  },
});

/* ---------------------- Quiz Schema ---------------------- */
const quizSchema = new Schema({
  quizType: { type: String, default: "multiple-choice" },
  totalQuestions: Number,
  score: { type: Number, default: 0 },
  isAttempted: { type: Boolean, default: false },
  answers: [
    {
      question: { type: String, required: true },
      questionType: {
        type: String,
        enum: ["multiple-choice", "short-answer", "long-answer"],
        default: "multiple-choice",
      },
      options: [String], // only for multiple-choice
      userAnswer: String,
      correctAnswer: String, // only for MCQ or short-answer
      isCorrect: Boolean, // auto evaluated for MCQ & short
      explanation: String,
    },
  ],
  attemptedAt: { type: Date, default: Date.now },
});

/* ---------------------- Chat Schema ---------------------- */
const chatSchema = new Schema({
  messages: [
    {
      role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

/* ---------------------- PDF Study Material Schema ---------------------- */
const pdfMaterialSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true, // cloud URL or local path
  },
  description: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  // ✅ Store all quizzes with latest attempt data
  quizzes: [quizSchema],
  chat_sessions: [chatSchema],
  RAG_id: {
    type: String,
  },
  // ✅ New field: store page texts
  pages: [
    {
      pageNumber: Number,
      text: String,
      summary: String,
    },
  ],
});

/* ---------------------- User Schema ---------------------- */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // ✅ Each user can have multiple study materials
    study_materials: [pdfMaterialSchema],

    // ✅ Overall performance tracking
    progress: {
      totalQuizzes: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      strengths: [
        {
          type: String
        }
      ],
      weaknesses: [{ type: String }],
    },
  },
  { timestamps: true }
);

/* ---------------------- Export ---------------------- */
const User = mongoose.model("User", userSchema);
export default User;
