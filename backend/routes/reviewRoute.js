import express from 'express';
import { 
    createReview,
    getReviewsByFoodId,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
    getUserReviews,
    getReviewableItems
} from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

// User routes (protected)
router.post('/create', authMiddleware, createReview);
router.get('/user', authMiddleware, getUserReviews);
router.get('/reviewable-items', authMiddleware, getReviewableItems);
router.get('/reviewable/:orderId', authMiddleware, getReviewableItems);

// Public routes
router.get('/food/:foodId', getReviewsByFoodId);

// Admin routes (protected)
router.get('/admin/all', adminAuthMiddleware, getAllReviews);
router.patch('/admin/:reviewId', adminAuthMiddleware, updateReviewStatus);
router.delete('/admin/:reviewId', adminAuthMiddleware, deleteReview);

export default router; 