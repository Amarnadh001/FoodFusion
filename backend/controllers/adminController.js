// backend/controllers/adminController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import userModel from '../models/userModel.js';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await userModel.findById(req.admin.id).select('-password');
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile'
    });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const admin = await userModel.findById(req.admin.id);

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin profile'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await userModel.findById(req.admin.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // Add token to blacklist if implementing token blacklisting
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt for:', email);
    console.log('Password received:', password ? 'Yes (length: ' + password.length + ')' : 'No');

    // Find user with detailed logging
    const user = await userModel.findOne({ email });
    console.log('User details:', {
      found: user ? 'Yes' : 'No',
      isAdmin: user?.isAdmin,
      hasPassword: user?.password ? 'Yes' : 'No',
      passwordLength: user?.password?.length
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Debug password verification
    console.log('Attempting password verification');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password);
    
    // Verify password with detailed logging
    let isValid = false;
    try {
      isValid = await bcrypt.compare(String(password), user.password);
      console.log('Password comparison result:', isValid);
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying credentials'
      });
    }

    if (!isValid) {
      console.log('Password verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check admin status after successful password verification
    if (!user.isAdmin) {
      console.log('User is not an admin');
      return res.status(401).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Generate token with proper secret
    const token = jwt.sign(
      { 
        id: user._id,
        isAdmin: true,
        email: user.email
      },
      process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful, sending response');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin registration with password hashing
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Admin registration attempt:', { email, passwordLength: password?.length });

    // Hash password with logging
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);
    console.log('Password hashed successfully:', {
      originalLength: password?.length,
      hashLength: hashedPassword?.length
    });

    // Create admin user
    const admin = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isAdmin: true,
      emailVerified: true
    });

    console.log('Admin created successfully:', {
      email: admin.email,
      isAdmin: admin.isAdmin,
      hasPassword: !!admin.password
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully'
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'Email already exists' : 'Registration failed'
    });
  }
};

export const verifyAdminToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ 
      _id: decoded.id,
      isAdmin: true
    }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

// Promote user to admin
export const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find and update user
    const user = await userModel.findOneAndUpdate(
      { email },
      { 
        $set: { 
          isAdmin: true,
          emailVerified: true 
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote user to admin'
    });
  }
};

// Admin logout
export const adminLogout = async (req, res) => {
  try {
    // You might want to implement token blacklisting here
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// Reset admin password
export const resetAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await userModel.findOne({ email, isAdmin: true });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: admin.email,
      subject: 'Admin Password Reset',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.ADMIN_URL}/reset-password?token=${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    });

    res.json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset password link'
    });
  }
};