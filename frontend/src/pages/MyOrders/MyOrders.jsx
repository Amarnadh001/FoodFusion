import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import { toast } from 'react-toastify';

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [reviewableItems, setReviewableItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            console.log("Orders fetched:", response.data.data);
            setData(response.data.data);
            
            // Get reviewable items
            const reviewableResponse = await axios.get(url + "/api/review/reviewable-items", { headers: { token } });
            console.log("Reviewable items:", reviewableResponse.data);
            
            if (reviewableResponse.data.success) {
                setReviewableItems(reviewableResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching orders or reviewable items:", error);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    const handleReviewClick = (foodId, orderId, foodName) => {
        console.log("Review click with foodId:", foodId, "orderId:", orderId, "foodName:", foodName);
        
        // Validate that we have the required data
        if (!foodId) {
            console.error("Missing foodId for review");
            toast.error("Cannot review this item: Missing food information");
            return;
        }
        
        if (!orderId) {
            console.error("Missing orderId for review");
            toast.error("Cannot review this item: Missing order information");
            return;
        }
        
        setSelectedItem({ 
            foodId: foodId.toString ? foodId.toString() : String(foodId), 
            orderId: orderId.toString ? orderId.toString() : String(orderId),
            foodName 
        });
        setShowReviewForm(true);
    }

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        setSelectedItem(null);
        fetchOrders();
        toast.success("Thank you for your review!");
    }

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

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            
            {showReviewForm && selectedItem && (
                <div className="review-overlay">
                    <div className="review-modal">
                        <button 
                            className="close-review-btn" 
                            onClick={() => setShowReviewForm(false)}
                        >
                            ×
                        </button>
                        <ReviewForm 
                            foodId={selectedItem.foodId} 
                            orderId={selectedItem.orderId}
                            foodName={selectedItem.foodName}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    </div>
                </div>
            )}
            
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className="my-orders-order">
                            <img src={assets.parcel_icon} alt="" />
                            <div className="order-items">
                                {order.items.map((item, itemIndex) => {
                                    // Make sure foodId exists and is properly formatted
                                    const itemFoodId = item.foodId || (item._id ? item._id : null);
                                    console.log("Rendering item:", item.name, "foodId:", itemFoodId, "orderId:", order._id);
                                    
                                    if (!itemFoodId) {
                                        console.warn("Item missing foodId:", item);
                                    }
                                    
                                    // Check if this item can be reviewed (either through API or default logic)
                                    const canReview = order.status === "Delivered" && 
                                                    order.allowReview && 
                                                    itemFoodId && 
                                                    (reviewableItems.length === 0 || // If no reviewable items are available
                                                     isReviewable(itemFoodId, order._id)); // Or if this item is in the list
                                    
                                    console.log("Can review item:", item.name, canReview);
                                    
                                    return (
                                    <div key={itemIndex} className="order-item">
                                        <p>{item.name} x {item.quantity}</p>
                                        {canReview && (
                                            <button 
                                                className="review-btn"
                                                onClick={() => handleReviewClick(itemFoodId, order._id, item.name)}
                                            >
                                                Review
                                            </button>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                            <p>₹{order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p className={`status ${order.status.toLowerCase()}`}>
                                <span>&#x25cf;</span> <b>{order.status}</b>
                            </p>
                            <button onClick={fetchOrders} className="track-btn">Track Order</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyOrders
