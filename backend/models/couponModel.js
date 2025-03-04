// backend/models/couponModel.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // Discount percentage
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;