import express from "express"
import { 
  listOrders, 
  placeOrder, 
  updateOrderStatus, 
  userOrders, 
  verifyOrder,
  requestCancellation,
  handleCancellationRequest,
  getCancellationRequests,
  trackOrder,
  cancelOrder,
  getOrderStatus
} from "../controllers/orderController.js"
import adminAuthMiddleware from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// User orders Routes
router.post("/place", authMiddleware, placeOrder);
router.post("/status", authMiddleware, updateOrderStatus);
router.post("/userorders", authMiddleware, userOrders);
router.post("/verify", authMiddleware, verifyOrder);
router.post("/track/:orderId", authMiddleware, trackOrder);
router.get("/track-status/:orderId", authMiddleware, getOrderStatus);
router.post("/cancel", authMiddleware, cancelOrder);

// Cancellation Routes
router.post("/cancel-request", authMiddleware, requestCancellation);
router.post("/handle-cancellation", adminAuthMiddleware, handleCancellationRequest);
router.get("/cancellation-requests", adminAuthMiddleware, getCancellationRequests);

// Admin Routes
router.get("/list", adminAuthMiddleware, listOrders);

// Utility route to fix old delivered orders (admin only)
router.get("/fix-delivered-orders", adminAuthMiddleware, async (req, res) => {
    try {
        // Find all delivered orders that don't have allowReview set
        const deliveredOrders = await Order.find({ 
            status: "Delivered", 
            allowReview: { $ne: true } 
        });
        
        console.log(`Found ${deliveredOrders.length} delivered orders without allowReview`);
        
        // Update them all to have allowReview=true and ensure items have proper fields
        let updatedCount = 0;
        
        for (const order of deliveredOrders) {
            // Process items to ensure they have foodId and isReviewed
            const updatedItems = order.items.map(item => ({
                ...item,
                foodId: item.foodId || item._id,
                isReviewed: item.isReviewed || false,
                name: item.name || "Unknown Item",
                price: item.price || 0,
                quantity: item.quantity || 1
            }));
            
            // Set allowReview to true
            order.allowReview = true;
            order.items = updatedItems;
            
            // Save the order
            await order.save();
            updatedCount++;
        }
        
        return res.status(200).json({
            success: true,
            message: `Updated ${updatedCount} delivered orders to have allowReview=true`,
            updatedCount
        });
    } catch (error) {
        console.error("Error fixing delivered orders:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fix delivered orders"
        });
    }
});

// Add debug route to check tracking
router.get("/track-test/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log("Track test route called with orderId:", orderId);
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: true,
            message: "Order found",
            data: {
                orderId: order._id,
                status: order.status,
                allowReview: order.allowReview,
                items: order.items.length
            }
        });
    } catch (error) {
        console.error("Track test error:", error);
        return res.status(500).json({
            success: false,
            message: "Error in test tracking",
            error: error.message
        });
    }
});

export default router;
