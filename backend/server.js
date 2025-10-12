import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {connectDB} from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import studyRoutes from "./routes/study.routes.js";
import youtubeRoutes from "./routes/youtube.routes.js";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/documents", pdfRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/youtube", youtubeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
