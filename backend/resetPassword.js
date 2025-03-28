import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userModel from "./models/userModel.js";

// Load environment variables
dotenv.config();

// Connect to the database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connected for password reset'))
  .catch(err => console.error('Database connection error:', err));

// Function to reset a user's password directly
const resetPassword = async (email, newPassword) => {
  try {
    const user = await userModel.findOne({ email });
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      process.exit(1);
    }
    
    // Hash the new password manually to ensure it's done correctly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Set the password directly to ensure the pre-save hook doesn't run
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });
    
    console.log(`Password for ${email} has been reset successfully!`);
    console.log('You should now be able to log in with the new password.');
    
    // Display the hashed password for verification
    console.log(`Hashed password stored in DB: ${user.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

// Email and new password for the user
const email = "tirumalareddysai136@gmail.com";
const newPassword = "test123";

// Reset the password
resetPassword(email, newPassword); 