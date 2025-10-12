import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
// Generate Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}); // short-lived
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }); // long-lived
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    
    // Check if user exists
    const existing = await User.findOne({ email_id: email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Default PDF study material
    const defaultStudyMaterial = {
      title: "PHYSICS PART TEXTBOOK FOR CLASS XI",
      pdfUrl: "https://res.cloudinary.com/dsikrz9h8/image/upload/v1760031316/NCERT-Class-11-Physics-Part-1_jokdqv.pdf",
      RAG_id: "ncert-class-11-physics-part-1-1760033673675",
      description: "NCERT Physics Class XI Part 1 PDF",
      pages: [],
      quizzes: [],
      chat_sessions: [],
    };

    console.log(defaultStudyMaterial);

    // Process PDF to extract page text from local file
    try {
      const pdfFilePath = path.join(process.cwd(), 'uploads', 'physics.pdf');
      console.log(`Loading PDF from: ${pdfFilePath}`);

      // Load PDF using PDFLoader
      const pdfLoader = new PDFLoader(pdfFilePath, { splitPages: true });
      const rawDocs = await pdfLoader.load();
      console.log(`✅ Loaded ${rawDocs.length} pages from PDF`);
      
      // Store raw page content
      defaultStudyMaterial.pages = rawDocs.map((doc, index) => ({
        pageNumber: index + 1,
        text: doc.pageContent,
        summary: "",
      }));

      console.log(`✅ Extracted text from ${defaultStudyMaterial.pages.length} pages`);

    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      // Continue with empty pages if PDF processing fails
    }

    const user = await User.create({
      name,
      email_id: email,
      password: hash,
      study_materials: [defaultStudyMaterial],
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email_id: user.email_id,
        study_materials: user.study_materials,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};



// Login User
export const loginUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email_id: email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      msg: "Login successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
