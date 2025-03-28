// admin/src/pages/Coupons/AddCoupon.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Coupons.css";
import api from "../../utils/api";

const AddCoupon = () => {
  const [couponData, setCouponData] = useState({
    code: "",
    discount: "",
    expiresAt: "",
    minOrderAmount: "0",
    maxUses: "",
    description: ""
  });
  
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setCouponData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Validate inputs
      if (parseInt(couponData.discount) <= 0 || parseInt(couponData.discount) > 100) {
        toast.error("Discount must be between 1 and 100");
        return;
      }
      
      const response = await api.post("/api/coupon/add", couponData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setCouponData({ 
          code: "", 
          discount: "", 
          expiresAt: "",
          minOrderAmount: "0",
          maxUses: "",
          description: ""
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding coupon");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-container">
      <div className="coupon-header">
        <h2>Add New Coupon</h2>
        <p>Create discount codes for your customers</p>
      </div>
      
      <div className="coupon-form-container">
        <form className="coupon-form" onSubmit={onSubmitHandler}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="code">Coupon Code</label>
              <input
                id="code"
                onChange={onChangeHandler}
                value={couponData.code}
                type="text"
                name="code"
                placeholder="e.g. WELCOME20"
                required
                disabled={loading}
              />
              <small>Customers will enter this code at checkout</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                onChange={onChangeHandler}
                value={couponData.discount}
                type="number"
                name="discount"
                min="1"
                max="100"
                placeholder="e.g. 20"
                required
                disabled={loading}
              />
              <small>Percentage discount to apply</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiresAt">Expiration Date</label>
              <input
                id="expiresAt"
                onChange={onChangeHandler}
                value={couponData.expiresAt}
                type="date"
                name="expiresAt"
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
              <small>The coupon will expire at the end of this day</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="minOrderAmount">Minimum Order Amount</label>
              <input
                id="minOrderAmount"
                onChange={onChangeHandler}
                value={couponData.minOrderAmount}
                type="number"
                name="minOrderAmount"
                min="0"
                placeholder="e.g. 100"
                disabled={loading}
              />
              <small>Minimum cart value to apply coupon (0 for no minimum)</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxUses">Max Number of Uses</label>
              <input
                id="maxUses"
                onChange={onChangeHandler}
                value={couponData.maxUses}
                type="number"
                name="maxUses"
                min="1"
                placeholder="e.g. 100"
                disabled={loading}
              />
              <small>Limit how many times this coupon can be used (optional)</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <input
                id="description"
                onChange={onChangeHandler}
                value={couponData.description}
                type="text"
                name="description"
                placeholder="e.g. Welcome discount for new customers"
                disabled={loading}
              />
              <small>Internal note about this coupon's purpose</small>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="coupon-submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoupon;