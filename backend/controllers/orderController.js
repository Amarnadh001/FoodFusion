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
    let { userId, items, amount, address, paymentMethod, couponCode } = req.body;

    // Validate required fields
    if (!userId || !items || !amount || !address) {
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

    const newOrder = new orderModel({
      userId: userId,
      items: items,
      amount: amount,
      address: address,
      payment: paymentMethod === "cod" ? true : false,
      paymentMethod: paymentMethod,
      discount: discountAmount, // Save the discount amount
      couponCode: couponCode, // Save the coupon code used
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

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
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
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
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

export { listOrders, placeOrder, updateStatus, userOrders, verifyOrder };
