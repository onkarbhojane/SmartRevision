# 🎓 SmartRevision

### *AI-Powered Learning Companion for Students*

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://smart-revision-umber.vercel.app/)
[![License](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/onkarbhojane/SmartRevision)

*Transform your study sessions with AI-driven quizzes, intelligent chatbot assistance, and RAG-powered answers from your coursebooks.*

[🚀 Live Demo](https://smart-revision-umber.vercel.app/) • [📖 Documentation](#-features) • [🐛 Report Bug](https://github.com/onkarbhojane/SmartRevision/issues) • [✨ Request Feature](https://github.com/onkarbhojane/SmartRevision/issues)

![SmartRevision Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=SmartRevision+-+AI+Learning+Platform)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Why SmartRevision?](#-why-smartrevision)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Guide](#-usage-guide)
- [🏗️ Project Architecture](#️-project-architecture)
- [🔧 API Documentation](#-api-documentation)
- [🌟 Key Highlights](#-key-highlights)
- [📸 Screenshots](#-screenshots)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

---

## ✨ Features

<table>
<tr>
<td width="50%">

---

## 🎯 Why SmartRevision?

```
Traditional Study          →          SmartRevision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Manual note-taking      →    🤖 AI-generated summaries
❓ Unanswered doubts       →    💬 Instant RAG-based answers
📄 Generic practice tests  →    🎯 PDF-specific quiz generation
📊 No progress tracking    →    📈 Detailed analytics dashboard
⏰ Time-consuming revision →    ⚡ Smart, efficient learning
🔍 Hard to find info       →    🎯 Pinpoint-accurate citations
```

### 💡 Core Benefits

- **Save Time**: Get instant answers instead of searching through pages
- **Learn Better**: AI-powered quizzes adapt to your knowledge level
- **Track Progress**: Visual analytics show your improvement over time
- **Stay Organized**: All your study materials in one place
- **Study Anywhere**: Fully responsive design works on any device

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Technologies

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend Technologies

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### AI & Cloud Services

![Gemini](https://img.shields.io/badge/Gemini_2.0-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

### Additional Tools

![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF6C37?style=for-the-badge&logo=multer&logoColor=white)
![PDF.js](https://img.shields.io/badge/PDF.js-FF0000?style=for-the-badge&logo=adobe&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
✅ Node.js >= 18.x
✅ npm >= 9.x or yarn >= 1.22.x
✅ MongoDB >= 6.x (local or Atlas)
✅ Git
```

### 📦 Installation

**Step 1: Clone the repository**

```bash
git clone https://github.com/onkarbhojane/SmartRevision.git
cd SmartRevision
```

**Step 2: Backend Setup**

```bash
cd backend
npm install
```

**Step 3: Create Environment Variables**

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/smartlearnaidb

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_this
ACCESS_TOKEN_EXPIRY=100m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration (for PDF/image storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here_optional

# Pinecone Configuration (Vector Database)
PINECONE_ENVIRONMENT=us-east-1
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=smartrevision-embeddings

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Step 4: Start Backend Server**

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

✅ Backend server should be running on `https://smartrevision.onrender.com`

**Step 5: Frontend Setup** *(Open a new terminal)*

```bash
cd ../frontend
npm install
```

**Step 6: Configure Frontend Environment** (Optional)

Create `.env` in the `frontend` directory if you need custom configuration:

```env
VITE_API_BASE_URL=https://smartrevision.onrender.com/api
VITE_APP_NAME=SmartRevision
```

**Step 7: Start Frontend Development Server**

```bash
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

### 🎉 Success!

Open your browser and navigate to `http://localhost:5173` to see SmartRevision in action!

---

## 📖 Usage Guide

### 🎯 Getting Started

#### 1. **Create Your Account**

```
→ Click "Sign Up" on the homepage
→ Enter your details (name, email, password)
→ Verify your email (if enabled)
→ Log in with your credentials
```

#### 2. **Upload Your First PDF**

```
→ Navigate to "Documents" or "Upload PDF"
→ Click "Upload" button
→ Select your coursebook PDF (max 50MB)
→ Wait for processing and embedding
→ Your PDF is now ready for use!
```

#### 3. **Start Learning**

```
→ Select a PDF from your library
→ Choose between Chat, Quiz, or Study modes
→ Start asking questions or taking quizzes
→ Track your progress in the Dashboard
```

### 💬 Chat Features

The AI chat interface provides intelligent, context-aware responses with citations.

**Example Questions:**

```plaintext
✏️ "Explain Newton's laws from Chapter 3"
✏️ "What is the formula for kinetic energy?"
✏️ "Summarize pages 45-50"
✏️ "Give me examples of thermodynamics applications"
✏️ "What are the key points in Section 2.3?"
```

**Response Format:**

```
📚 According to page 23: "Force equals mass times acceleration (F = ma). 
   This fundamental principle describes the relationship between force, 
   mass, and acceleration."

📖 See also page 24 for practical examples.
```

### 📝 Quiz Generation

#### Step-by-Step Guide:

1. **Select PDF Source**

   - Choose "All PDFs" for mixed content
   - Select specific PDF for focused practice
2. **Choose Question Type**

   - 📊 **MCQ** (Multiple Choice Questions) - 4 options, 1 correct
   - ✍️ **SAQ** (Short Answer Questions) - Brief explanations
   - 📄 **LAQ** (Long Answer Questions) - Detailed responses
3. **Configure Quiz**

   - Number of questions (5-50)
   - Difficulty level (Easy/Medium/Hard)
   - Time limit (optional)
4. **Take Quiz**

   - Read questions carefully
   - Submit your answers
   - Get instant feedback
5. **Review Results**

   - View score and percentage
   - Read detailed explanations
   - Identify areas for improvement

### 📊 Dashboard Analytics

Track your learning progress with comprehensive analytics:

- **Performance Overview**: Overall accuracy and completion rate
- **Topic-wise Analysis**: Strengths and weaknesses by subject
- **Historical Trends**: Progress over time with graphs
- **Recent Activity**: Latest quizzes and study sessions
- **Achievements**: Badges and milestones

---

## 🏗️ Project Architecture

### Directory Structure

```
SmartRevision/
│
├── 📁 frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Shared components (Button, Input, etc.)
│   │   │   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   │   ├── pdf/             # PDF viewer and management
│   │   │   ├── quiz/            # Quiz generation and taking
│   │   │   ├── chat/            # Chat interface components
│   │   │   ├── dashboard/       # Analytics and progress tracking
│   │   │   └── auth/            # Authentication forms
│   │   │
│   │   ├── pages/               # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Quiz.tsx
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts
│   │   │   └── useQuiz.ts
│   │   │
│   │   ├── contexts/            # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── services/            # API service functions
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── quiz.service.ts
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   │
│   │   ├── types/               # TypeScript type definitions
│   │   │   ├── user.types.ts
│   │   │   ├── quiz.types.ts
│   │   │   └── chat.types.ts
│   │   │
│   │   ├── constants/           # App constants
│   │   ├── store/               # State management (if using Redux)
│   │   ├── styles/              # Global styles
│   │   └── assets/              # Images, fonts, etc.
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
└── 📁 backend/
    ├── config/
    │   ├── db.js                # MongoDB connection
    │   ├── cloudinary.js        # Cloudinary config
    │   └── mailer.js            # Email configuration
    │
    ├── controllers/
    │   ├── auth.controller.js   # Authentication logic
    │   ├── chat.controller.js   # Chat endpoints
    │   ├── document.controller.js # PDF management
    │   ├── quiz.controller.js   # Quiz generation
    │   ├── study.controller.js  # Study sessions
    │   └── user.controller.js   # User management
    │
    ├── middleware/
    │   ├── auth.js              # Authentication middleware
    │   ├── JWT.js               # JWT validation
    │   ├── upload.js            # File upload handling
    │   └── errorHandler.js      # Error handling
    │
    ├── models/
    │   ├── User.model.js        # User schema
    │   ├── Chat.model.js        # Chat history schema
    │   ├── Document.model.js    # PDF metadata schema
    │   ├── Quiz.model.js        # Quiz schema
    │   └── Progress.model.js    # User progress schema
    │
    ├── routes/
    │   ├── auth.routes.js       # Authentication routes
    │   ├── chat.routes.js       # Chat routes
    │   ├── pdf.routes.js        # PDF routes
    │   ├── quiz.routes.js       # Quiz routes
    │   ├── study.routes.js      # Study session routes
    │   └── user.routes.js       # User routes
    │
    ├── services/
    │   ├── aiService.js         # Gemini API integration
    │   ├── embeddingService.js  # Text embedding generation
    │   ├── pdfService.js        # PDF processing
    │   ├── quizService.js       # Quiz generation logic
    │   ├── ragService.js        # RAG implementation
    │   └── vectorService.js     # Pinecone operations
    │
    ├── utils/
    │   ├── cloudinary.js        # Cloudinary helpers
    │   ├── pdfParser.js         # PDF text extraction
    │   └── validators.js        # Input validation
    │
    ├── uploads/                 # Temporary file storage
    │   └── .gitkeep
    │
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── server.js                # Express server setup
    └── index.js                 # Entry point
```

### Data Flow Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ HTTP/REST
       ▼
┌─────────────┐
│  Express    │
│  Server     │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  MongoDB    │  │ Cloudinary  │
│  Database   │  │   (PDFs)    │
└─────────────┘  └─────────────┘
       │
       ▼
┌─────────────┐
│   Gemini    │
│     AI      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Pinecone   │
│  (Vectors)  │
└─────────────┘
```

---

## 🔧 API Documentation

### Base URL

```
https://smartrevision.onrender.com/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: {
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: {
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### PDF Management Endpoints

#### Upload PDF

```http
POST /api/pdf/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

FormData: {
  "file": <PDF file>,
  "title": "Physics Chapter 1"
}

Response: {
  "success": true,
  "data": {
    "documentId": "...",
    "url": "...",
    "status": "processing"
  }
}
```

#### Get All PDFs

```http
GET /api/pdf/getDat
Authorization: Bearer <access_token>

Response: {
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "url": "...",
      "pageCount": 150,
      "uploadedAt": "..."
    }
  ]
}
```

### Chat Endpoints

#### Send Message

```http
POST /api/chat/:documentId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Explain Newton's first law",
  "documentId": "optional_pdf_id"
}

Response: {
  "success": true,
  "data": {
    "response": "...",
    "citations": [
      { "page": 23, "snippet": "..." }
    ]
  }
}
```

### Quiz Endpoints

#### Generate Quiz

```http
POST /api/quiz/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "documentId": "...",
  "questionType": "MCQ",
  "count": 10,
  "difficulty": "medium"
}

Response: {
  "success": true,
  "data": {
    "quizId": "...",
    "questions": [...]
  }
}
```

#### Submit Quiz

```http
POST /api/quiz/:documentId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quizId": "...",
  "answers": ["A", "B", "C", ...]
}

Response: {
  "success": true,
  "data": {
    "score": 8,
    "total": 10,
    "percentage": 80,
    "explanations": [...]
  }
}
```

---

## 🌟 Key Highlights

### 🧠 RAG (Retrieval-Augmented Generation)

SmartRevision uses advanced RAG technology to provide accurate answers:

1. **PDF Chunking**: Documents are split into semantic chunks
2. **Embedding Generation**: Each chunk is converted to vector embeddings
3. **Vector Storage**: Embeddings stored in Pinecone for fast retrieval
4. **Semantic Search**: User queries are matched against stored embeddings
5. **Context Injection**: Relevant chunks are sent to LLM for answer generation
6. **Citation Tracking**: Answers include page numbers and text snippets

```
User Query → Embedding → Pinecone Search → Top K Chunks → LLM → Answer + Citations
```

### 🎲 Dynamic Quiz Engine

Intelligent quiz generation powered by AI:

- **Content Analysis**: LLM analyzes PDF content structure
- **Question Generation**: Creates diverse, relevant questions
- **Difficulty Adaptation**: Adjusts based on user performance
- **Explanation Generation**: Provides detailed answer explanations
- **Performance Tracking**: Monitors progress over time

### 📱 Responsive Design

Mobile-first approach with TailwindCSS:

- **Breakpoints**: Optimized for mobile, tablet, and desktop
- **Touch Gestures**: Swipe navigation and touch-friendly controls
- **Performance**: Lazy loading and code splitting
- **Animations**: Smooth transitions with Framer Motion

### 🚀 LLM Integration

Powered by cutting-edge AI models:

- **Gemini 2.0 Flash**: Fast, efficient responses
- **Contextual Understanding**: Maintains conversation context
- **Multimodal Support**: Text and image processing
- **Streaming Responses**: Real-time answer generation

---

## 📸 Screenshots

<div align="center">

### 🏠 Home Page
<<<<<<< HEAD
<img width="1906" height="916" alt="image" src="https://github.com/user-attachments/assets/be39b185-2269-4a45-ae11-d6a490a27a61" />

### 💬 Chat Interface
<img width="813" height="799" alt="image" src="https://github.com/user-attachments/assets/3eafd2c7-5166-4743-bbbe-c0df4fa1cd1e" />
<img width="770" height="569" alt="image" src="https://github.com/user-attachments/assets/50ee1edb-2f7c-4ce9-98f9-c230140880d3" />


### 📝 Quiz Taking
<img width="1159" height="888" alt="image" src="https://github.com/user-attachments/assets/584ed0ee-7468-422c-870a-329311266dfa" />

<img width="1511" height="882" alt="image" src="https://github.com/user-attachments/assets/3330917b-fc19-4961-be08-31d92527bfbe" />

### 📊 Dashboard Analytics
<img width="1874" height="902" alt="image" src="https://github.com/user-attachments/assets/857d2e7c-6ac1-4aa2-83e4-f6c0bcb5c26d" />

=======

![Home Page](https://via.placeholder.com/800x450/6366f1/ffffff?text=Home+Page)

### 💬 Chat Interface

![Chat Interface](https://via.placeholder.com/800x450/10b981/ffffff?text=Chat+Interface)

### 📝 Quiz Taking

![Quiz Interface](https://via.placeholder.com/800x450/f59e0b/ffffff?text=Quiz+Interface)

### 📊 Dashboard Analytics

![Dashboard](https://via.placeholder.com/800x450/8b5cf6/ffffff?text=Dashboard+Analytics)
>>>>>>> 2d95e9c (readme)

</div>

---

## 🔮 Roadmap

### 🎯 Phase 1 - Core Features (Completed ✅)

- [X] User authentication and authorization
- [X] PDF upload and management
- [X] RAG-based chat with citations
- [X] Quiz generation (MCQ, SAQ, LAQ)
- [X] Basic progress tracking
- [X] Responsive UI

### 🚀 Phase 2 - Enhanced Features (In Progress 🔄)

- [X] Advanced analytics dashboard
- [ ] YouTube video recommendations
- [ ] Topic-based PDF filtering
- [ ] Collaborative study sessions
- [ ] Spaced repetition algorithm
- [ ] Export quiz results as PDF

### 🌟 Phase 3 - Advanced Features (Planned 📅)

- [ ] Dark mode support
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Voice input for questions
- [ ] Flashcard generation
- [ ] Study groups and social features
- [ ] Mobile app (React Native)

### 🎨 Phase 4 - Innovations (Future 🔮)

- [ ] AR/VR study environments
- [ ] Personalized AI tutor
- [ ] Gamification and achievements
- [ ] Integration with school LMS
- [ ] Offline mode support
- [ ] Real-time collaboration tools

---

## 🤝 Contributing

We love contributions! SmartRevision is an open-source project and we welcome contributions of all kinds.

### How to Contribute

1. **🍴 Fork the Repository**

   ```bash
   # Click the 'Fork' button on GitHub
   ```
2. **📥 Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/SmartRevision.git
   cd SmartRevision
   ```
3. **🌿 Create a Branch**

   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b bugfix/fix-issue
   ```
4. **✍️ Make Your Changes**

   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation
5. **✅ Commit Your Changes**

   ```bash
   git add .
   git commit -m "Add: Amazing new feature"
   ```

   **Commit Message Convention:**

   - `Add:` New features
   - `Fix:` Bug fixes
   - `Update:` Updates to existing features
   - `Docs:` Documentation changes
   - `Style:` Code style/formatting changes
   - `Refactor:` Code refactoring
   - `Test:` Adding or updating tests
6. **📤 Push to Your Fork**

   ```bash
   git push origin feature/amazing-feature
   ```
7. **🔀 Open a Pull Request**

   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes
   - Submit!

### Contribution Guidelines

- **Code Quality**: Write clean, maintainable code
- **Testing**: Add tests for new features
- **Documentation**: Update docs for significant changes
- **Commit Messages**: Use clear, descriptive messages
- **Pull Requests**: One feature/fix per PR
- **Code Review**: Be open to feedback

### Areas for Contribution

- 🐛 **Bug Fixes**: Found a bug? Fix it!
- ✨ **New Features**: Have an idea? Implement it!
- 📚 **Documentation**: Improve docs and tutorials
- 🎨 **UI/UX**: Enhance the design
- 🧪 **Testing**: Write more tests
- 🌐 **Translations**: Add multi-language support

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Error

```
Error: MongoNetworkError: failed to connect to server
```

**Solution:**

- Ensure MongoDB is running: `mongod --version`
- Check `MONGO_URI` in `.env` file
- Verify network connectivity

#### 2. Pinecone API Error

```
Error: Pinecone API key invalid
```

**Solution:**

- Verify `PINECONE_API_KEY` in `.env`
- Check Pinecone dashboard for correct API key
- Ensure index name matches configuration

#### 3. PDF Upload Fails

```
Error: File too large or unsupported format
```

**Solution:**

- Check file size (max 50MB)
- Ensure file is a valid PDF
- Clear browser cache
- Check Cloudinary quota

#### 4. Frontend Not Loading

```
Error: Cannot GET /
```

**Solution:**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 5. JWT Token Expired

```
Error: 401 Unauthorized
```

**Solution:**

- Log out and log in again
- Check `ACCESS_TOKEN_EXPIRY` in `.env`
- Clear browser cookies

#### 6. Quiz Generation Fails

```
Error: Failed to generate quiz
```

**Solution:**

- Ensure PDF is fully processed
- Check Gemini API key validity
- Verify API quota limits
- Try with a smaller question count

### Getting Help

If you encounter issues not listed here:

1. **Check Existing Issues**: [GitHub Issues](https://github.com/onkarbhojane/SmartRevision/issues)
2. **Create New Issue**: Provide detailed error messages and steps to reproduce
3. **Join Discussions**: [GitHub Discussions](https://github.com/onkarbhojane/SmartRevision/discussions)

---

## 📊 Performance Benchmarks

<<<<<<< HEAD
| Feature         | Metric               | Performance    |
| --------------- | -------------------- | -------------- |
| PDF Upload      | Time (10MB file)     | ~1-2 minutes   |
| PDF Processing  | Chunking & Embedding | ~10-15 seconds |
| Chat Response   | Average latency      | < 2 seconds    |
| Quiz Generation | 10 questions         | ~30-60 seconds   |
| Vector Search   | Query time           | < 100ms        |
| Page Load       | Initial load         | < 1 second     |
| API Response    | Average              | < 500ms        |

## 🧑‍💻 Authors

- **Onkar Bhojane** – Full-Stack Developer, AI Integration  
  - [GitHub](https://github.com/onkarbhojane)  
  - [LinkedIn](https://www.linkedin.com/in/onkar-bhojane)

## 📄 License

This project is licensed under the **ISC License**.  
See the [LICENSE](LICENSE) file for more details.

