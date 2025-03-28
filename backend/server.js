import cors from "cors";
import dotenv from 'dotenv';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from 'http';
import { connectDB } from "./config/db.js";
import adminAuthMiddleware from "./middleware/adminAuth.js";
import adminRouter from './routes/adminAuthRoute.js';
import adminRoute from "./routes/adminRoute.js";
import authRoute from "./routes/authRoute.js";
import cartRouter from "./routes/cartRoute.js";
import couponRouter from "./routes/couponRoute.js";
import foodRouter from "./routes/foodRoute.js";
import orderRouter from "./routes/orderRoute.js";
import userRouter from "./routes/userRoute.js";
// Load environment variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Enhanced CORS configuration with proper origin handling
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5174',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

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
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminRoute);

// Update the admin routes configuration
app.use("/api/admin", adminRouter);

// Protected admin routes (require admin authentication)
app.use("/api/admin/manage", adminAuthMiddleware, (req, res, next) => {
  if (!req.admin?.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "active", message: "Food Ordering API Service" });
});

// Start the server
const server = createServer(app);

server.listen(port, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} mode`);
  console.log(`🔗 Access endpoints at http://localhost:${port}`);
});
// mongodb+srv://amarnadh:369082@cluster0.wbhb7.mongodb.net/?
