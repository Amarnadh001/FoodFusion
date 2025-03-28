import express from "express"
import { listOrders, placeOrder, updateOrderStatus, userOrders, verifyOrder } from "../controllers/orderController.js"
import adminAuthMiddleware from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";
import orderModel from "../models/orderModels.js";

const router = express.Router();

// User orders Routes
router.post("/place", authMiddleware, placeOrder);
router.post("/verify", verifyOrder);
router.post("/status", updateOrderStatus);
router.post("/userorders", authMiddleware, userOrders);

// Admin Routes
router.get("/list", adminAuthMiddleware, listOrders);

// Utility route to fix old delivered orders (admin only)
router.get("/fix-delivered-orders", adminAuthMiddleware, async (req, res) => {
    try {
        // Find all delivered orders that don't have allowReview set
        const deliveredOrders = await orderModel.find({ 
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

export default router;
