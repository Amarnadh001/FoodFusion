// admin/src/pages/Coupons/AddCoupon.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddCoupon = ({ url }) => {
  const [couponData, setCouponData] = useState({
    code: "",
    discount: "",
    expiresAt: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setCouponData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/coupon/add`, couponData);
      if (response.data.success) {
        toast.success(response.data.message);
        setCouponData({ code: "", discount: "", expiresAt: "" });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error adding coupon");
      console.error(error);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-product-name flex-col">
          <p>Coupon Code</p>
          <input
            onChange={onChangeHandler}
            value={couponData.code}
            type="text"
            name="code"
            placeholder="Enter coupon code"
            required
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Discount Percentage</p>
          <input
            onChange={onChangeHandler}
            value={couponData.discount}
            type="number"
            name="discount"
            placeholder="Enter discount percentage"
            required
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Expiration Date</p>
          <input
            onChange={onChangeHandler}
            value={couponData.expiresAt}
            type="date"
            name="expiresAt"
            required
          />
        </div>
        <button type="submit" className="add-btn">
          Add Coupon
        </button>
      </form>
    </div>
  );
};

export default AddCoupon;