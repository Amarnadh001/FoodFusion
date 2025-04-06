import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    phone: {
        type: String,
        required: false, // Make phone optional for easier login
        validate: {
            validator: function (v) {
                return !v || /\d{10}/.test(v); // Ensure phone number is 10 digits if provided
            },
            message: "Phone number must be 10 digits",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure we're using bcryptjs consistently
userSchema.pre('save', async function(next) {
    // Only hash the password if it's been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        console.log("Pre-save hook: Hashing password"); 
        console.log("Original password length:", this.password?.length);
        console.log("Original password type:", typeof this.password);
        
        // Ensure password is a string and trim any whitespace
        const passwordToHash = String(this.password).trim();
        console.log("Cleaned password length:", passwordToHash.length);
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(passwordToHash, salt);
        
        console.log("Password hashed successfully");
        console.log("Hashed password length:", this.password?.length);
        
        // Verify the hash works
        const isMatch = await bcrypt.compare(passwordToHash, this.password);
        console.log("Hash verification test:", isMatch);
        
        if (!isMatch) {
            console.error("❌ Hash verification failed during save!");
        }
        
        next();
    } catch (error) {
        console.error("❌ Error hashing password:", error);
        next(error);
    }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
