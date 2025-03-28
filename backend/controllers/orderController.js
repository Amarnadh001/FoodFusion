import Stripe from 'stripe';
import orderModel from "../models/orderModels.js";
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';
import Coupon from '../models/couponModel.js'; // Import the Coupon model

dotenv.config(); // Load environment variables

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5174";

  try {
    let { items, amount, address, paymentMethod, couponCode } = req.body;
    const userId = req.body.userId || req.user?._id;

    // Validate userId
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    // Validate required fields
    if (!items || !amount || !address) {
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
    const newOrder = new orderModel({
      userId: userId,
      items: processedItems,
      amount: amount,
      address: address,
      payment: paymentMethod === "cod" ? true : false,
      paymentMethod: paymentMethod,
      discount: discountAmount, // Save the discount amount
      couponCode: couponCode, // Save the coupon code used
      allowReview: false, // Initially false, set to true when delivered
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Save order date for aggregation
    newOrder.date = new Date();

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

    if (paymentMethod === "cod") {
      // For COD, just return success
      res.json({ success: true, orderId: newOrder._id });
    } else {
      // For online payment, create a Stripe session
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
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
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
    const orders = await orderModel.find({ userId: req.body.userId });
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

// List all orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
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
    
    // Find the order first to check and update items if needed
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure all items have foodId and isReviewed properties
    let updatedItems = false;
    const processedItems = order.items.map(item => {
      console.log("Processing item:", item);
      
      // Create a proper item object with all required fields
      const updatedItem = {
        ...item,
        foodId: item.foodId || item._id, // Ensure foodId exists
        isReviewed: item.isReviewed || false, // Ensure isReviewed is defined
        // Make sure these essential fields exist
        name: item.name || "Unknown Item",
        price: item.price || 0,
        quantity: item.quantity || 1
      };
      
      // Check if we made any changes to the item
      if (JSON.stringify(item) !== JSON.stringify(updatedItem)) {
        updatedItems = true;
      }
      
      return updatedItem;
    });
    
    // If items needed updating, update them
    if (updatedItems) {
      order.items = processedItems;
      console.log("Updated items with proper values");
    }
    
    // If status is 'Delivered', set allowReview to true to enable user reviews
    // OR if it's already delivered but allowReview is not set
    if (status === 'Delivered' || order.status === 'Delivered') {
      if (!order.allowReview) {
        console.log("Setting allowReview to true for order:", orderId);
        order.allowReview = true;
      }
    }
    
    // Update the status if it's changing
    if (status && status !== order.status) {
      order.status = status;
    }
    
    // Save the order with all updates
    const updatedOrder = await order.save();
    
    console.log("Updated order:", updatedOrder._id, "status:", updatedOrder.status, "allowReview:", updatedOrder.allowReview);
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

export { listOrders, placeOrder, updateOrderStatus, userOrders, verifyOrder };
