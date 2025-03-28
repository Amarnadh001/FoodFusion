import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    discountedTotal, // Get discountedTotal from context
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponValid, setCouponValid] = useState(true);

  const onCHangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderData) => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert('Razorpay SDK failed to load');
      return;
    }

    try {
      // First create a server-side order
      const orderResponse = await axios.post(
        url + '/api/order/place', 
        orderData,
        { headers: { token } }
      );
      
      if (!orderResponse.data.success) {
        alert('Failed to create order: ' + (orderResponse.data.message || 'Unknown error'));
        return;
      }
      
      const options = {
        key: 'rzp_live_kYGlb6Srm9dDRe', // Replace with your Razorpay key
        amount: discountedTotal * 100, // Use discountedTotal
        currency: 'INR',
        name: 'FOOD FUSION',
        description: 'Food Order Payment',
        order_id: orderResponse.data.orderId, // Get the order ID from the server
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              url + '/api/order/verify',
              {
                orderId: orderResponse.data.orderId,
                success: "true",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { token } }
            );

            if (verifyResponse.data.success) {
              navigate('/myorders');
            } else {
              alert('Payment verification failed: ' + (verifyResponse.data.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Payment verification error:', error.response?.data || error);
            alert('Payment verification failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: '#ff6b6b',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error initializing payment:', error.response?.data || error);
      alert('Error initializing payment: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo['quantity'] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    // The userId is handled on the server through the token
    // No need to include it in the request data
    let orderData = {
      address: data,
      items: orderItems,
      amount: discountedTotal, // Use discountedTotal
      couponCode: couponCode, // Include coupon code
      paymentMethod: paymentMethod // Include payment method
    };
    
    console.log("Sending order data:", orderData);

    if (paymentMethod === 'cod') {
      try {
        const response = await axios.post(url + '/api/order/place', orderData, {
          headers: { token },
        });
        if (response.data.success) {
          navigate('/myorders');
        } else {
          alert('Error placing order: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error placing order:', error.response?.data || error);
        alert('Error placing order: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
    } else if (paymentMethod === 'card') {
      // Handle Razorpay payment
      await handleRazorpayPayment(orderData);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onCHangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onCHangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onCHangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onCHangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onCHangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onCHangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onCHangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            onChange={onCHangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onCHangeHandler}
          value={data.phone}
          type="tel"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
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
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{discountedTotal.toFixed(2)}</b> {/* Use discountedTotal */}
            </div>
          </div>
          <button type="submit">
            {paymentMethod === 'cod' ? 'PLACE ORDER' : 'PROCEED TO PAYMENT'}
          </button>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Online Payment</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;