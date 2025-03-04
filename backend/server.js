import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import cartRouter from "./routes/cartRoute.js";
import foodRouter from "./routes/foodRoute.js";
import orderRouter from "./routes/orderRoute.js";
import userRouter from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import couponRouter from "./routes/couponRoute.js";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "https://foodfusion-frontend.onrender.com",
    process.env.ADMIN_URL || "https://foodfusion-admin.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/auth", authRoute);
app.use("/api/coupon", couponRouter); // Add the coupon routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "active", message: "Food Ordering API Service" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`🔗 Access endpoints at http://localhost:${port}`);
});
// mongodb+srv://amarnadh:369082@cluster0.wbhb7.mongodb.net/?
