import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();
const otpStorage = {}; // Temporary storage for OTPs

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "amarnadhchow@gmail.com",
        pass: "gawcvlvnhhirnhkm",
    },
});

// Clean up expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const email in otpStorage) {
        if (otpStorage[email].expiresAt < now) {
            delete otpStorage[email];
        }
    }
}, 60 * 1000);

// Send OTP to email
router.post("/send-otp", async (req, res) => {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name?.trim() || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email, and phone are required",
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please login.",
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes

        // Send OTP via email
        await transporter.sendMail({
            from: '"Del Exscel" <amarnadhchow@gmail.com>',
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        });

        console.log("Sending OTP Payload:", {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        });

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("OTP send error:", error);

        // Handle email sending errors
        if (error.code === "EAUTH" || error.code === "EENVELOPE") {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please check your email configuration.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again.",
        });
    }
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required",
        });
    }

    const storedData = otpStorage[email];

    // Check OTP existence
    if (!storedData) {
        return res.status(400).json({
            success: false,
            message: "OTP not found or expired",
        });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
        delete otpStorage[email];
        return res.status(400).json({
            success: false,
            message: "OTP expired. Please request a new one.",
        });
    }

    // Validate OTP
    if (otp !== storedData.otp) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP",
        });
    }

    // Mark OTP as verified
    storedData.verified = true;
    res.json({
        success: true,
        message: "OTP verified. Please create your password.",
    });
});

// Complete registration
router.post("/register", async (req, res) => {
    console.log("Incoming Registration Request:", req.body);

    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name?.trim() || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password, and phone are required",
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please login.",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone.replace(/\D/g, ""), // Clean phone number
        });

        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser);

        res.json({
            success: true,
            message: "Registration successful!",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages,
            });
        }

        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
        });
    }
});

// Helper function for JWT generation
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET, // Use a secret key from environment variables
        { expiresIn: "1h" } // Token expires in 1 hour
    );
};

export default router;