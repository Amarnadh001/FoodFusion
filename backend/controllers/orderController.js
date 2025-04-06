import Stripe from 'stripe';
import Order from "../models/orderModel.js";
import userModel from '../models/userModel.js';
import { sendEmail } from '../utils/email.js';
import dotenv from 'dotenv';
import Coupon from '../models/couponModel.js'; // Import the Coupon model

dotenv.config(); // Load environment variables

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ORDER_STATUS_FLOW = {
    'Food Processing': 'Your food is prepared',
    'Your food is prepared': 'Out for Delivery',
    'Out for Delivery': 'Delivered'
};



// Place user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "https://foodfusion-admin.onrender.com";

  try {
    let { items, amount, address, paymentMethod, couponCode, deliveryAddress, contactNumber } = req.body;
    const userId = req.body.userId || req.user?._id;

    // Validate userId
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    // Validate required fields
    if (!items || !amount || !address || !deliveryAddress || !contactNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate address fields
    const requiredAddressFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missingFields = requiredAddressFields.filter(field => !address[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing address fields", 
        missingFields 
      });
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, active: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        discountAmount = (amount * coupon.discount) / 100;
        amount -= discountAmount;
      }
    }

    // Ensure all items have foodId and isReviewed properties
    const processedItems = items.map(item => ({
      ...item,
      foodId: item.foodId || item._id, // Ensure foodId exists
      isReviewed: false // Initialize isReviewed as false
    }));

    console.log("Creating order with userId:", userId);
    const newOrder = new Order({
      userId: userId,
      items: processedItems,
      amount: amount,
      address: address,
      payment: paymentMethod === "cod",
      paymentMethod: paymentMethod,
      discount: discountAmount,
      couponCode: couponCode || '',
      allowReview: false,
      deliveryAddress: deliveryAddress,
      contactNumber: contactNumber,
      status: 'Food Processing',
      paymentStatus: paymentMethod === "cod" ? 'completed' : 'pending'
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    if (paymentMethod === "cod") {
      // For COD, just return success
      res.json({ success: true, orderId: newOrder._id });
    } else {
      // For online payment, create a Stripe session
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Convert to smallest currency unit
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 8 * 100, // Delivery charges
      },
      quantity: 1,
    });

      const session = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: 'payment',
        success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      });

      res.json({ success: true, session_url: session.url, orderId: newOrder._id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place order", 
      error: error.message,
      details: error.name === 'ValidationError' ? 'Please check all required fields are filled correctly' : 'An error occurred while processing your order. Please try again.' 
    });
  }
};

// Verify order payment
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await Order.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await Order.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place order", 
      error: error.message,
      details: error.name === 'ValidationError' ? 'Please check all required fields are filled correctly' : 'An error occurred while processing your order. Please try again.' 
    });
  }
};

// Fetch user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.body.userId })
      .populate({
        path: 'items.foodId',
        select: 'image name'
      })
      .sort({ createdAt: -1 });

    // Format the orders to include image URLs
    const formattedOrders = orders.map(order => {
      const formattedItems = order.items.map(item => ({
        ...item.toObject(),
        image: item.foodId?.image || item.foodId?.imageUrl || null
      }));

      return {
        ...order.toObject(),
        items: formattedItems
      };
    });

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders", 
      error: error.message
    });
  }
};

// List all orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place order", 
      error: error.message,
      details: error.name === 'ValidationError' ? 'Please check all required fields are filled correctly' : 'An error occurred while processing your order. Please try again.' 
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log("Updating order status:", orderId, status);
    
    // Validate the new status
    const validStatuses = [
        'Food Processing',
        'Your food is prepared',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status provided"
        });
    }

    // Find the order first to check and update items if needed
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Don't update if order is cancelled or has pending cancellation
    if (order.status === 'Cancelled' || order.cancellationRequest?.status === 'pending') {
        return res.status(400).json({
            success: false,
            message: "Cannot update status of cancelled orders or orders with pending cancellation"
        });
    }
    
    // Update the status
    order.status = status;
    
    // If status is 'Delivered', set allowReview to true to enable user reviews
    if (status === 'Delivered') {
      order.allowReview = true;
    }
    
    // Save the order with all updates
    const updatedOrder = await order.save();
    
    console.log("Updated order:", updatedOrder._id, "status:", updatedOrder.status);
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Request order cancellation
const requestCancellation = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.body.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!reason) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    // Find the order first
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if order is delivered
    if (order.status === 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        message: "Delivered orders cannot be cancelled" 
      });
    }

    // Update order with cancellation request
    order.status = 'cancellation_requested';
    order.cancellationRequest = {
      reason,
      requestedAt: new Date(),
      status: 'pending'
    };

    await order.save();

    res.json({ 
      success: true, 
      message: "Cancellation request submitted successfully",
      data: order
    });
  } catch (error) {
    console.error('Error requesting cancellation:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit cancellation request",
      error: error.message
    });
  }
};

// Handle cancellation request (admin)
const handleCancellationRequest = async (req, res) => {
  try {
    const { orderId, action, adminResponse } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid action. Must be 'approved' or 'rejected'" 
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.cancellationRequest?.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "No pending cancellation request found for this order" 
      });
    }

    // Update cancellation request status and order status immediately
    order.cancellationRequest.status = action;
    order.cancellationRequest.adminResponse = adminResponse || null;

    // Update order status based on action
    if (action === 'approved') {
      order.status = 'cancelled';
      // Ensure any tracking-related fields are cleared
      order.trackingStatus = null;
      order.trackingUpdatedAt = null;
      order.allowReview = false; // Disable reviews for cancelled orders
      // Prevent the order from being marked as delivered
      order.deliveredAt = null;
    } else {
      // If rejected, revert to previous status
      order.status = order.items.some(item => item.isReviewed) ? 'Your food is prepared' : 'Food Processing';
    }

    await order.save();

    res.json({ 
      success: true, 
      message: `Cancellation request ${action} successfully`,
      data: order
    });
  } catch (error) {
    console.error('Error handling cancellation request:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to handle cancellation request",
      error: error.message
    });
  }
};

// Get cancellation requests (admin)
const getCancellationRequests = async (req, res) => {
  try {
    const orders = await Order.find({
      'cancellationRequest.status': 'pending'
    }).populate('userId', 'name email phone');

    res.json({ 
      success: true, 
      data: orders
    });
  } catch (error) {
    console.error('Error fetching cancellation requests:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cancellation requests",
      error: error.message
    });
  }
};

// Add this function to handle order tracking and status updates
const trackOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status } = req.body;

        // Validate the new status
        const validStatuses = [
            'Food Processing',
            'Your food is prepared',
            'Out for Delivery',
            'Delivered'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status provided"
            });
        }

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Don't update if order is cancelled or has pending cancellation
        if (order.status === 'Cancelled' || order.cancellationRequest?.status === 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot update status of cancelled orders or orders with pending cancellation"
            });
        }

        // Update the order status
        order.status = status;
        
        // If the new status is 'Delivered', set allowReview to true
        if (status === 'Delivered') {
            order.allowReview = true;
        }

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: { 
                status: order.status,
                allowReview: order.allowReview
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.body.userId || req.user?._id;

        console.log('Cancel order request:', { orderId, userId });

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        console.log('Finding order:', { orderId, userId });
        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            console.log('Order not found:', { orderId, userId });
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log('Current order status:', order.status);

        // Check if order is in a cancellable state
        if (!['Food Processing', 'Your food is prepared'].includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be cancelled in its current state: ${order.status}` 
            });
        }

        // Update order status to cancelled
        order.status = 'Cancelled';
        console.log('Saving cancelled order...');
        const savedOrder = await order.save();
        console.log('Order cancelled successfully:', savedOrder._id);

        res.json({ 
            success: true, 
            message: "Order cancelled successfully",
            data: savedOrder
        });
    } catch (error) {
        console.error('Error cancelling order:', {
            error: error.message,
            stack: error.stack,
            orderId: req.body.orderId,
            userId: req.body.userId
        });
        res.status(500).json({ 
            success: false, 
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

// Get order status without updating it
const getOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status retrieved successfully",
            data: { 
                status: order.status,
                allowReview: order.allowReview,
                cancellationRequest: order.cancellationRequest
            }
        });
    } catch (error) {
        console.error('Error getting order status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get order status",
            error: error.message
        });
    }
};

export {
  placeOrder,
  userOrders,
  verifyOrder,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  requestCancellation,
  handleCancellationRequest,
  getCancellationRequests,
  getOrderStatus,
  listOrders
};
