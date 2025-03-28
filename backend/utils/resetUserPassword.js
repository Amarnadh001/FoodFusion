import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

dotenv.config();

const resetUserPassword = async (email, newPassword) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log('Password hashed successfully');

        // Update user
        const user = await userModel.findOneAndUpdate(
            { email },
            { 
                $set: { 
                    password: hashedPassword,
                    isAdmin: true,
                    emailVerified: true
                } 
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found');
            return;
        }

        // Verify password hash
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log('Password verification test:', isMatch);
        console.log('User updated:', {
            email: user.email,
            isAdmin: user.isAdmin,
            passwordUpdated: true,
            verificationSuccess: isMatch
        });

        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error resetting password:', error);
    }
    process.exit();
};

// Usage
const [email, newPassword] = process.argv.slice(2);
if (email && newPassword) {
    console.log('Resetting password for:', email);
    resetUserPassword(email, newPassword);
} else {
    console.log('Please provide email and new password');
    console.log('Usage: node resetUserPassword.js <email> <newPassword>');
    process.exit(1);
}