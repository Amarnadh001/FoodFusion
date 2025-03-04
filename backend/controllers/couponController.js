// backend/controllers/couponController.js
import Coupon from '../models/couponModel.js';

// Add a new coupon
const addCoupon = async (req, res) => {
  try {
    const { code, discount, expiresAt } = req.body;
    const coupon = new Coupon({ code, discount, expiresAt });
    await coupon.save();
    res.status(201).json({ success: true, message: 'Coupon added successfully', data: coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error adding coupon', error: error.message });
  }
};

// List all coupons
const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error listing coupons', error: error.message });
  }
};

// Update a coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expiresAt, active } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { code, discount, expiresAt, active },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating coupon', error: error.message });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting coupon', error: error.message });
  }
};

// Validate a coupon
const validateCoupon = async (req, res) => {
    try {
      let { code } = req.body;
      code = code.trim()
      const coupon = await Coupon.findOne({ code: code, active: true });

      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Invalid coupon code' });
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }

      res.status(200).json({ success: true, message: 'Coupon validated', data: coupon });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error validating coupon', error: error.message });
    }
  };

export { addCoupon, listCoupons, updateCoupon, deleteCoupon, validateCoupon };