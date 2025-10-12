import express from 'express';
import { getYouTubeRecommendations } from '../controllers/youtube.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get YouTube recommendations for a specific page
router.get('/:documentId/page/:pageNumber/youtube-recommendations', authMiddleware, getYouTubeRecommendations);

// Health check endpoint
// router.get('/health/youtube', authMiddleware, checkYouTubeHealth);

export default router;