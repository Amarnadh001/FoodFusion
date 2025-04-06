import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import './ReviewPage.css';
import { getToken } from '../../utils/auth';
import LoginPopup from '../../components/LoginPopup/LoginPopup';
import { toast } from 'react-toastify';

const ReviewPage = () => {
    const { foodId, orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(getToken());
    
    // Get food name from location state or set a default
    const foodName = location.state?.foodName || 'this item';

    useEffect(() => {
        // Check if user is logged in
        const currentToken = getToken();
        if (!currentToken) {
            setShowLogin(true);
        } else {
            setToken(currentToken);
        }
    }, []);

    const handleReviewSubmitted = () => {
        toast.success('Thank you for your review!');
        // Navigate back to My Orders page after a short delay
        setTimeout(() => {
            navigate('/myorders');
        }, 2000);
    };

    if (showLogin) {
        return <LoginPopup setShowLogin={setShowLogin} />;
    }

    return (
        <div className="review-page">
            <div className="review-page-container">
                <h2>Write Your Review</h2>
                <p className="review-subtitle">Share your experience with {foodName}</p>
                
                <ReviewForm 
                    foodId={foodId}
                    orderId={orderId}
                    foodName={foodName}
                    onReviewSubmitted={handleReviewSubmitted}
                />
                
                <button 
                    className="back-to-orders"
                    onClick={() => navigate('/myorders')}
                >
                    Back to My Orders
                </button>
            </div>
        </div>
    );
};

export default ReviewPage; 