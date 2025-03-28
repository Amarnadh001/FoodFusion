import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

dotenv.config();

const initializeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const adminData = {
            email: 'amarnadhchow1@gmail.com',
            password: '112233445566',
            name: 'Admin User 1',
            phone: '9985092359'
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Find and update or create admin
        const admin = await userModel.findOneAndUpdate(
            { email: adminData.email },
            {
                $set: {
                    name: adminData.name,
                    password: hashedPassword,
                    phone: adminData.phone,
                    isAdmin: true,
                    emailVerified: true
                }
            },
            { upsert: true, new: true }
        );

        console.log('Admin user created/updated:', {
            email: admin.email,
            isAdmin: admin.isAdmin,
            id: admin._id
        });

        // Verify password
        const isMatch = await bcrypt.compare(adminData.password, admin.password);
        console.log('Password verification:', isMatch);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
    process.exit();
};

initializeAdmin();