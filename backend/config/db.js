import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 15000,
            retryWrites: true,
            retryReads: true
        };

        await mongoose.connect(process.env.MONGODB_URL, options);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        throw error;
    }
}