import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import userModel from './models/userModel.js';

// Load environment variables
dotenv.config();

const resetUserPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const email = '99220041612@klu.ac.in';
        const newPassword = '99220040808'; // Set a new password

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log('Password hashed successfully');

        // Update user
        const user = await userModel.findOneAndUpdate(
            { email },
            { 
                $set: { 
                    password: hashedPassword
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

// Run the function
resetUserPassword(); 