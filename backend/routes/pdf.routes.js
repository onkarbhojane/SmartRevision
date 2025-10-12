import express from 'express';
import { uploadDocument, getUserDocuments, deleteDocument,getStudyMaterials } from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.js'; // JWT authentication
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Upload PDF
router.post('/upload', authMiddleware, upload.single('pdf'), uploadDocument);

// Get user's documents
router.get('/getData', authMiddleware, getUserDocuments);

// Delete document
router.delete('/:id', authMiddleware, deleteDocument);

router.get('/:id',authMiddleware, getStudyMaterials);

router.get('/:doumentId/page/:pageNumber/youtube-recommendations', authMiddleware, );
export default router;
