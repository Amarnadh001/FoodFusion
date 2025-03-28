import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

dotenv.config();

const makeUserAdmin = async (email, password) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Hash password if provided
        let update = {
            isAdmin: true,
            emailVerified: true
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }

        // Update user to admin
        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            { $set: update },
            { new: true }
        );

        if (updatedUser) {
            console.log('User updated successfully:', {
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            });
        } else {
            console.log('User not found');
        }

        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error making user admin:', error);
    }
    process.exit();
};

// Usage example: node makeUserAdmin.js email@example.com password123
const [email, password] = process.argv.slice(2);
if (email) {
    makeUserAdmin(email, password);
} else {
    console.log('Please provide an email address');
    process.exit(1);
}