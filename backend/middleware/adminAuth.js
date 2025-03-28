// backend/middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

    // Find user and verify admin status
    const user = await userModel.findOne({ 
      _id: decoded.id,
      isAdmin: true 
    }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Attach user to request
    req.admin = user;
    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export default adminAuth;