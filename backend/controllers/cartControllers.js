import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate input
    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Find user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update cart
    const cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    // Save updated cart
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added to Cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate input
    if (!userId || !itemId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Find user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update cart
    const cartData = userData.cartData || {};
    if (cartData[itemId]) {
      cartData[itemId] -= 1;

      // Remove item from cart if quantity is 0
      if (cartData[itemId] <= 0) {
        delete cartData[itemId];
      }

      // Save updated cart
      await userModel.findByIdAndUpdate(userId, { cartData });
      res.json({ success: true, message: "Removed from Cart" });
    } else {
      res.status(400).json({ success: false, message: "Item not in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch user cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Find user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return cart data
    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { addToCart, removeFromCart, getCart };
