import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getToken, getUserId } from '../../utils/auth';
import LoginPopup from '../../components/LoginPopup/LoginPopup';
import ImageWithFallback from '../../components/ImageWithFallback/ImageWithFallback';

const ORDER_STATUSES = {
    PROCESSING: 'Food Processing',
    PREPARED: 'Your food is prepared',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

const MyOrders = () => {
    const { url, token, userId, setToken, setUserId } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [reviewableItems, setReviewableItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [showCancellationModal, setShowCancellationModal] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = getToken();
        const storedUserId = getUserId();
        
        if (!storedToken || !storedUserId) {
            setShowLogin(true);
            return;
        }
        
        setToken(storedToken);
        setUserId(storedUserId);
        fetchOrders();
    }, []); // Remove dependencies to prevent infinite loop

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const currentToken = getToken();
            const currentUserId = getUserId();

            if (!currentToken || !currentUserId) {
                console.log('No token or userId found');
                setShowLogin(true);
                return;
            }

            console.log('Fetching orders for userId:', currentUserId);
            const response = await axios.post(
                `${url}/api/order/userorders`,
                { userId: currentUserId },
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'token': currentToken
                    }
                }
            );

            console.log('Orders response:', response.data);

            if (response.data.success) {
                setData(response.data.data);
            } else {
                console.error('Failed to fetch orders:', response.data.message);
                toast.error('Failed to fetch orders');
            }
            
            // Get reviewable items
            const reviewableResponse = await axios.get(
                `${url}/api/review/reviewable-items`,
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        'token': currentToken
                    } 
                }
            );
            
            console.log("Reviewable items response:", reviewableResponse.data);
            
            if (reviewableResponse.data.success) {
                setReviewableItems(reviewableResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders or reviewable items:', error.response || error);
            if (error.response?.status === 401) {
                setShowLogin(true);
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleReviewClick = (foodId, orderId, foodName) => {
        navigate(`/review/${foodId}/${orderId}`, { 
            state: { foodName } 
        });
    }

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        setSelectedItem(null);
        fetchOrders();
        toast.success("Thank you for your review!");
    }

    const handleCancelRequest = async (orderId) => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            setLoading(true);
            const currentToken = getToken();
            const currentUserId = getUserId();

            if (!currentToken || !currentUserId) {
                console.log('No token or userId found');
                setShowLogin(true);
                return;
            }

            console.log('Submitting cancellation request:', {
                orderId,
                reason: cancellationReason,
                userId: currentUserId
            });

            const response = await axios.post(
                `${url}/api/order/cancel-request`,
                {
                    orderId: orderId,
                    reason: cancellationReason,
                    userId: currentUserId
                },
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'token': currentToken
                    }
                }
            );

            if (response.data.success) {
                toast.success('Cancellation request submitted successfully');
                setCancellationReason('');
                setSelectedOrder(null);
                setShowCancellationModal(false);
                fetchOrders();
            } else {
                toast.error(response.data.message || 'Failed to submit cancellation request');
            }
        } catch (error) {
            console.error('Error submitting cancellation request:', error);
            if (error.response?.status === 401) {
                setShowLogin(true);
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Invalid request. Please check order status.');
            } else if (error.response?.status === 404) {
                toast.error('Order not found. Please refresh the page.');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to submit cancellation request. Please try again.';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = async (orderId) => {
        try {
            setLoading(true);
            
            // Find the current order
            const currentOrder = data.find(order => order._id === orderId);
            if (!currentOrder) {
                toast.error('Order not found');
                setLoading(false);
                return;
            }

            // Get authentication
            const currentToken = getToken();
            const currentUserId = getUserId();

            if (!currentToken || !currentUserId) {
                console.log('No token or userId found');
                setShowLogin(true);
                setLoading(false);
                return;
            }

            console.log('Tracking order:', { orderId, currentStatus: currentOrder.status });

            // Get the order status from the backend (try the track-test endpoint which is known to work)
            const response = await axios.get(
                `${url}/api/order/track-test/${orderId}`,
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'token': currentToken
                    }
                }
            );

            if (response.data.success) {
                const { status } = response.data.data;
                
                // Update local state if status is different
                if (status && status !== currentOrder.status) {
                    toast.success(`Order status: ${status}`);
                    setData(prevData => prevData.map(order => 
                        order._id === orderId 
                            ? { ...order, status: status } 
                            : order
                    ));
                } else {
                    toast.info(`Current order status: ${currentOrder.status}`);
                }
            } else {
                toast.info(`Current order status: ${currentOrder.status}`);
            }
            
        } catch (error) {
            console.error('Error tracking order:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication error. Please log in again.');
                setShowLogin(true);
            } else {
                // Fallback to showing the current status
                toast.info(`Current order status: ${currentOrder.status}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (order) => {
        if (!order || !order._id) {
            toast.error('Invalid order selected');
            return;
        }
        setSelectedOrder(order);
        setShowCancellationModal(true);
    };

    const handleCancelModalClose = () => {
        setShowCancellationModal(false);
        setSelectedOrder(null);
        setCancellationReason('');
    };

    // Check if an item is reviewable
    const isReviewable = (foodId, orderId) => {
        console.log("Checking if reviewable:", foodId, orderId);
        
        if (!reviewableItems || reviewableItems.length === 0) {
            console.log("No reviewable items available");
            return false;
        }
        
        if (!foodId || !orderId) {
            console.log("Missing foodId or orderId");
            return false;
        }
        
        // Special case: If order is delivered and allowReview is true, but no reviewable items found,
        // let's just allow it for all non-reviewed items for now
        if (reviewableItems.length === 0) {
            return true;
        }
        
        // Normalize ids to strings for comparison
        const normalizedFoodId = String(foodId);
        const normalizedOrderId = String(orderId);
        
        // Check if the item is in the reviewable items list
        const result = reviewableItems.some(item => {
            // First ensure item.foodId exists
            if (!item.foodId) return false;
            
            const itemFoodId = String(item.foodId);
            const itemOrderId = String(item.orderId);
            
            console.log("Comparing:", 
                        "item.foodId:", itemFoodId, 
                        "foodId:", normalizedFoodId,
                        "match:", itemFoodId === normalizedFoodId,
                        "item.orderId:", itemOrderId,
                        "orderId:", normalizedOrderId,
                        "match:", itemOrderId === normalizedOrderId);
                        
            return itemFoodId === normalizedFoodId && 
                   itemOrderId === normalizedOrderId && 
                   !item.isReviewed;
        });
        
        console.log("Is reviewable result:", result);
        return result;
    }

    const canCancelOrder = (status) => {
        // Allow cancellation for all statuses except Delivered and Cancelled
        return !['Delivered', 'Cancelled'].includes(status);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'green';
            case 'cancelled':
                return 'red';
            case 'cancellation_requested':
                return 'orange';
            default:
                return 'blue';
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <>
            {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            )}
            {error && (
                <div className="error-container">
                    <p>{error}</p>
                </div>
            )}
            {showCancellationModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Cancel Order</h3>
                        <p>Please provide a reason for cancellation:</p>
                        <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Enter cancellation reason"
                            rows="4"
                        />
                        <div className="modal-buttons">
                            <button onClick={handleCancelModalClose}>Close</button>
                            <button onClick={() => handleCancelRequest(selectedOrder._id)}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="my-orders">
                <h2>My Orders</h2>
                <div className="orders-list">
                    {loading ? (
                        <div className="loading">Loading orders...</div>
                    ) : data.length === 0 ? (
                        <div className="no-orders">
                            <p>No orders found</p>
                        </div>
                    ) : (
                        data.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <h3>Order #{order._id.slice(-6)}</h3>
                                    <span className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="order-details">
                                    {order.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="order-item">
                                            <img 
                                                src={item.image || assets.parcel_icon}
                                                alt={item.name}
                                                className="item-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = assets.parcel_icon;
                                                }}
                                            />
                                            <div className="item-details">
                                                <h4>{item.name}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: ₹{item.price}</p>
                                                
                                                {/* Add Review Button for Delivered orders */}
                                                {order.status === ORDER_STATUSES.DELIVERED && !item.isReviewed && (
                                                    <button
                                                        className="review-btn"
                                                        onClick={() => handleReviewClick(item.foodId, order._id, item.name)}
                                                    >
                                                        Write Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="order-summary">
                                        <p>Total Amount: ₹{order.amount}</p>
                                        <p>Status: <span style={{ color: getStatusColor(order.status) }}>{order.status}</span>
                                            {order.cancellationRequest?.status === 'pending' && (
                                                <span className="cancellation-pending">(Cancellation Pending)</span>
                                            )}</p>
                                        
                                        <div className="order-actions">
                                            {/* Track Order Button - Hide for Delivered and Cancelled orders */}
                                            {order.status !== 'Delivered' && 
                                             order.status !== 'Cancelled' &&
                                             !order.status.includes('cancel') && (
                                                <button
                                                    className="track-order-btn"
                                                    onClick={() => handleTrackOrder(order._id)}
                                                    disabled={loading}
                                                >
                                                    Track Order
                                                </button>
                                            )}
                                            
                                            {/* Cancel Order Button - Hide for Delivered and Cancelled orders */}
                                            {order.status !== 'Delivered' && 
                                             order.status !== 'Cancelled' &&
                                             !order.status.includes('cancel') && (
                                                <button
                                                    className="track-order-btn"
                                                    style={{ 
                                                        backgroundColor: '#e74c3c',
                                                        marginTop: '10px' 
                                                    }}
                                                    onClick={() => handleCancelClick(order)}
                                                    disabled={loading}
                                                >
                                                    Request Cancellation
                                                </button>
                                            )}
                                            
                                            {/* Cancellation Request Status */}
                                            {order.cancellationRequest && (
                                                <div className="cancellation-info">
                                                    <p className="cancellation-status">
                                                        Cancellation Request: {order.cancellationRequest.status}
                                                    </p>
                                                    {order.cancellationRequest.adminResponse && (
                                                        <p className="admin-response">
                                                            Admin Response: {order.cancellationRequest.adminResponse}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default MyOrders;
