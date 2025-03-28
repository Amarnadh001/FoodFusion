import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Connect to MongoDB directly
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to database');
    
    // Reset the password directly in the database
    try {
      // Use direct MongoDB commands for maximum reliability
      const db = mongoose.connection.db;
      const userCollection = db.collection('users');
      
      // First get the user to confirm it exists
      const user = await userCollection.findOne({ email: "tirumalareddysai136@gmail.com" });
      if (!user) {
        console.log("User not found!");
        process.exit(1);
      }
      
      console.log("Found user:", user.email);
      console.log("Current password hash:", user.password);
      
      // Generate a new password hash
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash("password123", salt);
      
      // Update the user with the new password hash
      const result = await userCollection.updateOne(
        { email: "tirumalareddysai136@gmail.com" },
        { $set: { password: newPasswordHash } }
      );
      
      console.log("Update result:", result);
      console.log("Password has been reset to 'password123' successfully!");
      
      // Test that we can verify the password
      const testVerify = await bcrypt.compare("password123", newPasswordHash);
      console.log("Password verification test:", testVerify);
      
      process.exit(0);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  }); 