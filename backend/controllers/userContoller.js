import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";

// 🔹 Generate JWT Token
const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in environment variables");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔹 Register User
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    console.log("Register attempt for:", email);

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists, please login" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // Create new user - password will be hashed by the pre-save middleware
        const newUser = new userModel({ name, email, password, phone });
        await newUser.save();
        console.log("User registered successfully:", email);

        const token = createToken(newUser._id);
        res.status(201).json({ success: true, token, message: "User registered successfully" });

    } catch (error) {
        console.error("❌ Error in registerUser:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🔹 Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    console.log("Password length:", password?.length);

    try {
        // ✅ Validate input fields
        if (!email || !password) {
            console.log("Missing email or password");
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // ✅ Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        console.log("User found:", user.email);
        console.log("User ID:", user._id);
        console.log("Stored password hash:", user.password);
        console.log("Attempting password comparison...");

        // ✅ Compare password with proper error handling
        let isMatch = false;
        try {
            // Convert password to string and trim any whitespace
            const cleanPassword = String(password).trim();
            console.log("Cleaned password length:", cleanPassword.length);
            
            isMatch = await bcrypt.compare(cleanPassword, user.password);
            console.log("Password comparison result:", isMatch);
            
            // If password doesn't match, try to debug the issue
            if (!isMatch) {
                console.log("Password verification failed. Debugging...");
                
                // Try to hash the input password to see if it matches the stored hash
                const salt = await bcrypt.genSalt(10);
                const hashedInput = await bcrypt.hash(cleanPassword, salt);
                console.log("New hash for input password:", hashedInput);
                
                // Check if the hashes are different
                if (hashedInput !== user.password) {
                    console.log("Hash comparison shows different hashes");
                }
            }
        } catch (compareError) {
            console.error("Password comparison error:", compareError);
            return res.status(500).json({ 
                success: false, 
                message: "Error verifying credentials" 
            });
        }
        
        if (!isMatch) {
            console.log("Password verification failed");
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // ✅ Generate token & send response
        const token = createToken(user._id);
        console.log("Login successful for:", email);
        res.status(200).json({ 
            success: true, 
            token, 
            userId: user._id,
            message: "Login successful" 
        });

    } catch (error) {
        console.error("❌ Error in loginUser:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

// 🔹 Get User By Email (for debugging)
const getUserByEmail = async (req, res) => {
    const { email } = req.params;
    
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Don't send the password hash
        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt
        };
        
        res.status(200).json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error("❌ Error in getUserByEmail:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🔹 Reset Password (for debugging)
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    
    try {
        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "Email and new password are required" });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        console.log("Resetting password for:", email);
        console.log("Old password hash:", user.password);
        
        // Hash the password manually to ensure it's done correctly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the password directly
        user.password = hashedPassword;
        await user.save({ validateBeforeSave: false });
        
        console.log("New password hash:", user.password);
        console.log("Password reset successful for:", email);
        
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("❌ Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🔹 Debug Password Hashing (for troubleshooting)
const debugPasswordHashing = async (req, res) => {
    const { password } = req.body;
    
    try {
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        
        // Generate hash with bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Test password verification
        const isMatch = await bcrypt.compare(password, hashedPassword);
        
        res.status(200).json({ 
            success: true, 
            originalPassword: password,
            hashedPassword: hashedPassword,
            passwordVerified: isMatch,
            message: "Password hashing debug complete" 
        });
    } catch (error) {
        console.error("❌ Error in debugPasswordHashing:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🔹 Debug Password (for troubleshooting)
const debugPassword = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }
        
        console.log("Debug password request for:", email);
        console.log("Password length:", password?.length);
        
        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        console.log("User found:", user.email);
        console.log("Stored password hash:", user.password);
        
        // Clean password
        const cleanPassword = String(password).trim();
        console.log("Cleaned password length:", cleanPassword.length);
        
        // Try to hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(cleanPassword, salt);
        console.log("New hash for input password:", hashedPassword);
        
        // Compare with stored hash
        const isMatch = await bcrypt.compare(cleanPassword, user.password);
        console.log("Password comparison result:", isMatch);
        
        // Return debug information
        res.status(200).json({ 
            success: true, 
            userFound: true,
            passwordMatch: isMatch,
            message: "Password debug complete" 
        });
    } catch (error) {
        console.error("❌ Error in debugPassword:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

export { loginUser, registerUser, getUserByEmail, resetPassword, debugPasswordHashing, debugPassword };
