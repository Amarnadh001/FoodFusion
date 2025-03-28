import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

dotenv.config();

const resetAdminPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Get admin email from env
        const adminEmail = process.env.ADMIN_EMAIL;
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        // Update admin user
        const updatedAdmin = await userModel.findOneAndUpdate(
            { email: adminEmail },
            {
                $set: {
                    password: hashedPassword,
                    isAdmin: true,
                    emailVerified: true
                }
            },
            { new: true }
        );

        if (updatedAdmin) {
            // Verify the password
            const isMatch = await bcrypt.compare(defaultPassword, updatedAdmin.password);
            console.log('Password reset successful');
            console.log('Password verification:', isMatch);
            console.log('Admin user:', {
                email: updatedAdmin.email,
                isAdmin: updatedAdmin.isAdmin,
                passwordHash: updatedAdmin.password
            });
        } else {
            console.log('Admin user not found');
        }

        await mongoose.connection.close();
        console.log('MongoDB connection closed');

    } catch (error) {
        console.error('Error resetting admin password:', error);
    }
    process.exit();
};

resetAdminPassword();