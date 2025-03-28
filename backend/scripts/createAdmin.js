import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

dotenv.config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        
        const password = process.env.ADMIN_DEFAULT_PASSWORD;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const adminUser = {
            name: 'Admin User',
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            phone: '1234567890',
            isAdmin: true,
            emailVerified: true
        };

        // Update or create admin user
        await userModel.findOneAndUpdate(
            { email: process.env.ADMIN_EMAIL },
            adminUser,
            { upsert: true, new: true }
        );

        console.log('Admin user created/updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdminUser();