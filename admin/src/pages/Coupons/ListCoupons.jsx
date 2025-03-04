// admin/src/pages/Coupons/ListCoupons.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ListCoupons = ({ url }) => {
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${url}/api/coupon/list`);
      if (response.data.success) {
        setCoupons(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching coupons");
      console.error(error);
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      const response = await axios.delete(`${url}/api/coupon/${couponId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error deleting coupon");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Coupons List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Code</b>
          <b>Discount</b>
          <b>Expires At</b>
          <b>Active</b>
          <b>Action</b>
        </div>
        {coupons.map((coupon, index) => (
          <div key={index} className="list-table-format">
            <p>{coupon.code}</p>
            <p>{coupon.discount}%</p>
            <p>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "N/A"}</p>
            <p>{coupon.active ? "Yes" : "No"}</p>
            <p onClick={() => deleteCoupon(coupon._id)} className="cursor">
              X
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCoupons;