import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";
import axios from "axios";

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    discountedTotal,
    setDiscountedTotal, // Get setDiscountedTotal from context
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const applyCoupon = async () => {
    try {
      // Validate coupon code
      if (!couponCode || couponCode.trim() === "") {
        setErrorMessage("Coupon code cannot be empty.");
        return;
      }

      const trimmedCouponCode = couponCode.trim(); // Trim whitespace
      const response = await axios.post(`${url}/api/coupon/validate`, { code: trimmedCouponCode });

      if (response.data.success) {
        const coupon = response.data.data;
        const discount = coupon.discount;
        const subtotal = getTotalCartAmount();
        const deliveryFee = subtotal === 0 ? 0 : 8;

        // Calculate discount amount
        const newDiscountAmount = (subtotal * discount) / 100;
        setDiscountAmount(newDiscountAmount);
        const newDiscountedTotal = subtotal + deliveryFee - newDiscountAmount;
        setDiscountedTotal(newDiscountedTotal); // Update discounted total in context
        setErrorMessage(""); // Clear any previous error messages
      } else {
        setErrorMessage(response.data.message || "Invalid coupon code.");
        setDiscountAmount(0);
        setDiscountedTotal(getTotalCartAmount() + 8); // Reset discounted total
      }
    } catch (error) {
      if (error.response) {
        // Handle server errors
        if (error.response.status === 400) {
          setErrorMessage("Coupon has expired.");
        } else if (error.response.status === 404) {
          setErrorMessage("Invalid coupon code.");
        } else {
          setErrorMessage("An error occurred while validating the coupon.");
        }
      } else {
        setErrorMessage("Network error. Please try again.");
      }
      setDiscountAmount(0);
      setDiscountedTotal(getTotalCartAmount() + 8); // Reset discounted total
      console.error("Coupon validation error:", error);
    }
  };

  // Update discounted total whenever cart items change
  React.useEffect(() => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 8;
    const newDiscountedTotal = subtotal + deliveryFee - discountAmount;
    setDiscountedTotal(newDiscountedTotal);
  }, [cartItems, discountAmount, getTotalCartAmount, setDiscountedTotal]);

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img 
                    src={`${url}/uploads/${item.imageUrl || item.image}`} 
                    alt={item.name}
                    onError={(e) => {
                      console.log(`Failed to load image: ${e.target.src}`);
                      e.target.src = `${url}/uploads/placeholder.jpg`;
                      e.target.onerror = () => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                        e.target.onerror = null; // Prevent infinite loop
                      };
                    }}
                  /> 
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 8}</p>
            </div>
            <hr />
            {discountAmount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount</p>
                  <p>- ₹{discountAmount.toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{discountedTotal.toFixed(2)}</b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input
                type="text"
                placeholder="promo code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={applyCoupon}>Submit</button>
            </div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;