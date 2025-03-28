// backend/controllers/adminAuthController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

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

// Store OTP temporarily
const otpStorage = {};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and check if they're an admin
    const user = await userModel.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized access or invalid credentials" 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate admin token
    const token = jwt.sign(
      { id: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const sendAdminVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists and is an admin
    const user = await userModel.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
    };

    // Send verification email
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Admin Account Verification",
      html: `
        <h1>Admin Account Verification</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `
    });

    res.json({
      success: true,
      message: "Verification code sent to email"
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code"
    });
  }
};

export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate OTP
    const storedData = otpStorage[email];
    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStorage[email];
      return res.status(400).json({
        success: false,
        message: "Verification code expired"
      });
    }

    // Update user as verified
    await userModel.findOneAndUpdate(
      { email },
      { emailVerified: true }
    );

    delete otpStorage[email];

    res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user to admin
    user.isAdmin = true;
    await user.save();

    res.json({
      success: true,
      message: "User promoted to admin successfully"
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to promote user to admin"
    });
  }
};