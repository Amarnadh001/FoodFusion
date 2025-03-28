// backend/routes/adminRoute.js
import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  logout,
  resetPassword,
  updateAdminProfile
} from '../controllers/adminController.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

// Admin auth routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminAuthMiddleware, getAdminProfile);
router.put('/profile', adminAuthMiddleware, updateAdminProfile);
router.post('/reset-password', adminAuthMiddleware, resetPassword);
router.post('/logout', adminAuthMiddleware, logout);

// Dashboard route
router.get('/dashboard', adminAuthMiddleware, getDashboardData);

export default router;