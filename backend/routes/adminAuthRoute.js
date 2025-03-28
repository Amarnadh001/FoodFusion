// backend/routes/adminAuthRoute.js
import express from 'express';
import {
  adminLogin,
  promoteToAdmin,
  adminLogout,
  resetAdminPassword
} from '../controllers/adminController.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/reset-password', resetAdminPassword);

// Protected routes
router.post('/promote', adminAuthMiddleware, promoteToAdmin);
router.post('/logout', adminAuthMiddleware, adminLogout);

export default router;