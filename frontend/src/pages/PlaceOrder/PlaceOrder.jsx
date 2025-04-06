import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './PlaceOrder.css';
import LoginPopup from '../../components/LoginPopup/LoginPopup';

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    token,
    userId,
    setToken,
    setUserId,
    food_list,
    cartItems,
    url,
    discountedTotal,
    combos,
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
  const [showLogin, setShowLogin] = useState(false);

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
        { 
          headers: { 
            'Content-Type': 'application/json',
            'token': token
          } 
        }
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
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  'token': token
                } 
              }
            );

            if (verifyResponse.data.success) {
              navigate('/myorders');
            } else {
              alert('Payment verification failed: ' + (verifyResponse.data.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Payment verification error:', error.response?.data || error);
            if (error.response?.status === 401) {
              // Token expired or invalid
              setShowLogin(true);
            } else {
              alert('Payment verification failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
            }
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
      if (error.response?.status === 401) {
        // Token expired or invalid
        setShowLogin(true);
      } else {
        alert('Error initializing payment: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    
    if (!token || !userId) {
      console.log('No token or userId found');
      setShowLogin(true);
      return;
    }

    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'country', 'zipcode', 'phone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(data.phone.toString().trim())) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    let orderItems = [];
    
    // Add regular food items
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          isReviewed: false
        });
      }
    });

    // Add combo items if they exist
    if (combos) {
      combos.forEach((combo) => {
        if (cartItems[combo._id] > 0) {
          orderItems.push({
            foodId: combo._id,
            name: combo.name,
            price: combo.price,
            quantity: cartItems[combo._id],
            isReviewed: false
          });
        }
      });
    }

    // Validate if cart is empty
    if (orderItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    // Format the delivery address as a single string
    const formattedAddress = `${data.street.trim()}, ${data.city.trim()}, ${data.state.trim()}, ${data.country.trim()} - ${data.zipcode.trim()}`;
    
    // Format the contact number (ensure it's a string and properly formatted)
    const formattedPhone = data.phone.toString().trim();

    let orderData = {
      userId: userId,
      items: orderItems,
      amount: discountedTotal,
      couponCode: couponCode || '',
      paymentMethod: paymentMethod,
      deliveryAddress: formattedAddress, // Required field
      contactNumber: formattedPhone, // Required field
      address: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        street: data.street.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zipcode: data.zipcode.trim(),
        country: data.country.trim(),
        phone: formattedPhone
      }
    };
    
    console.log("Sending order data:", orderData);

    try {
      const response = await axios.post(url + '/api/order/place', orderData, {
        headers: { 
          'Content-Type': 'application/json',
          'token': token
        },
      });
      
      if (response.data.success) {
        if (paymentMethod === 'cod') {
          navigate('/myorders');
        } else {
          // For online payment, handle Razorpay
          await handleRazorpayPayment(orderData);
        }
      } else {
        alert('Error placing order: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error placing order:', error.response?.data || error);
      if (error.response?.status === 401) {
        setShowLogin(true);
      } else {
        alert('Error placing order: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      setShowLogin(true);
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, userId]);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
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
                <b>₹{discountedTotal.toFixed(2)}</b>
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
    </>
  );
};

export default PlaceOrder;