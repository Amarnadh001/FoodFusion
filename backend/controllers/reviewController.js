import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        console.log("Review submission request body:", req.body);
        console.log("User from request:", req.user);
        
        const { foodId, orderId, rating, comment } = req.body;
        const userId = req.user._id;
        
        // Validate required fields
        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: 'Food ID is required'
            });
        }
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        // Check if order exists and belongs to user
        const order = await Order.findOne({ _id: orderId, userId });
        console.log("Found order:", order ? order._id : "No order found");
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or does not belong to user'
            });
        }
        
        // Check if order is delivered and can be reviewed
        if (order.status !== 'Delivered' || !order.allowReview) {
            return res.status(400).json({
                success: false,
                message: 'Can only review items from delivered orders'
            });
        }
        
        // Verify that the food item exists in the order
        const foodItem = order.items.find(item => {
            console.log("Comparing:", item.foodId, foodId, item.foodId == foodId);
            return String(item.foodId) === String(foodId);
        });
        
        console.log("Found food item:", foodItem);
        
        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found in this order'
            });
        }
        
        // Check if the item has already been reviewed
        if (foodItem.isReviewed) {
            return res.status(400).json({
                success: false,
                message: 'This item has already been reviewed'
            });
        }
        
        // Check if a review already exists
        const existingReview = await Review.findOne({ 
            userId, 
            foodId,
            orderId
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this food item for this order'
            });
        }
        
        // Get user info
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Create new review
        const newReview = new Review({
            userId,
            foodId,
            orderId,
            userName: user.name || 'Anonymous',
            rating,
            comment,
            isApproved: true // Auto-approve for now, can be changed later
        });
        
        const savedReview = await newReview.save();
        
        // Mark the item as reviewed in the order
        for (let i = 0; i < order.items.length; i++) {
            if (String(order.items[i].foodId) === String(foodId)) {
                order.items[i].isReviewed = true;
                break;
            }
        }
        await order.save();
        
        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: savedReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create review'
        });
    }
};

// Get reviews for a specific food item
export const getReviewsByFoodId = async (req, res) => {
    try {
        const { foodId } = req.params;
        
        const reviews = await Review.find({ 
            foodId, 
            isApproved: true 
        })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

        // Calculate average rating
        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
        });
        
        const averageRating = reviews.length > 0 
            ? (totalRating / reviews.length).toFixed(1) 
            : 5; // Default to 5 if no reviews

        return res.status(200).json({
            success: true,
            count: reviews.length,
            averageRating: parseFloat(averageRating),
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// Get all reviews (for admin)
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('userId', 'name email')
            .populate('foodId', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// Update review approval status (admin only)
export const updateReviewStatus = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { isApproved } = req.body;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { isApproved },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
            data: review
        });
    } catch (error) {
        console.error('Error updating review status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update review status'
        });
    }
};

// Delete a review (admin only)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Optionally, update the order to mark item as not reviewed
        await Order.updateOne(
            { "_id": review.orderId, "items.foodId": review.foodId },
            { $set: { "items.$.isReviewed": false } }
        );

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const reviews = await Review.find({ userId })
            .populate('foodId', 'name imageUrl')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// Get reviewable items for a specific order or all orders for a user
export const getReviewableItems = async (req, res) => {
    try {
        console.log("Getting reviewable items for user:", req.user);
        
        const userId = req.user._id;
        const orderId = req.params.orderId;
        
        // If orderId is provided, get reviewable items for that specific order
        if (orderId) {
            const order = await Order.findOne({ _id: orderId, userId });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or does not belong to user'
                });
            }

            // Only delivered orders can be reviewed
            if (order.status !== 'Delivered' || !order.allowReview) {
                return res.status(400).json({
                    success: false,
                    message: 'Can only review items from delivered orders',
                    data: []
                });
            }

            // Filter items that haven't been reviewed yet
            const reviewableItems = order.items.filter(item => !item.isReviewed);

            return res.status(200).json({
                success: true,
                data: reviewableItems.map(item => ({
                    foodId: item.foodId || item._id,
                    orderId: order._id,
                    name: item.name,
                    isReviewed: item.isReviewed || false
                }))
            });
        } 
        // If no orderId is provided, get all reviewable items from all delivered orders
        else {
            const orders = await Order.find({ 
                userId, 
                status: 'Delivered',
                allowReview: true
            });
            
            console.log("Found delivered orders with allowReview=true:", orders.length);
            
            let reviewableItems = [];
            
            orders.forEach(order => {
                console.log("Checking order:", order._id, "with", order.items.length, "items");
                
                order.items.forEach(item => {
                    console.log("Item details:", JSON.stringify(item));
                    if (!item.isReviewed) {
                        // Extract proper foodId from the item
                        const foodId = item.foodId || (item._id ? item._id : null);
                        console.log("Found reviewable item:", item.name, "foodId:", foodId);
                        
                        if (foodId) {
                            reviewableItems.push({
                                foodId: foodId,
                                orderId: order._id,
                                name: item.name,
                                isReviewed: item.isReviewed || false
                            });
                        } else {
                            console.warn("Item missing foodId:", item);
                        }
                    }
                });
            });
            
            console.log("Total reviewable items:", reviewableItems.length);
            
            return res.status(200).json({
                success: true,
                data: reviewableItems
            });
        }
    } catch (error) {
        console.error('Error fetching reviewable items:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviewable items'
        });
    }
}; 