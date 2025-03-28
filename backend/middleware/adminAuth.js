// backend/middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token format) or token header (older format)
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, try the token header (for backward compatibility)
    if (!token) {
      token = req.headers.token;
    }

    if (!token) {
      console.log('Admin auth failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token with either JWT_ADMIN_SECRET or fallback to JWT_SECRET
    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    console.log('Admin auth: Token verified, checking admin status');

    // Find user and verify admin status
    const user = await userModel.findOne({ 
      _id: decoded.id,
      isAdmin: true 
    }).select('-password');

    if (!user) {
      console.log('Admin auth failed: Not authorized as admin');
      return res.status(401).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    console.log('Admin auth successful for:', user.email);

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