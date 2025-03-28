import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import './ReviewForm.css';

const ReviewForm = ({ foodId, orderId, foodName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { url, token } = useContext(StoreContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    // Check if foodId or orderId is undefined
    if (!foodId) {
      toast.error('Food ID is missing');
      return;
    }

    if (!orderId) {
      toast.error('Order ID is missing');
      return;
    }

    try {
      setLoading(true);
      
      // Ensure foodId is a string
      const reviewData = {
        foodId: String(foodId), // Safer than toString() for handling null/undefined
        orderId: String(orderId), // Safer than toString() for handling null/undefined
        rating,
        comment
      };
      
      console.log("Sending review data:", reviewData);
      
      const response = await axios.post(
        `${url}/api/review/create`, 
        reviewData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setRating(5);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'An error occurred while submitting your review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review for {foodName}</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-selector">
          <p>Rating:</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="review-comment">Your Review:</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this dish..."
            rows="4"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 