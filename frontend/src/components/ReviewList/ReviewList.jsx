import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './ReviewList.css';

const ReviewList = ({ foodId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const { url } = useContext(StoreContext);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/review/food/${foodId}`);
        
        if (response.data.success) {
          setReviews(response.data.data);
          
          // Calculate average rating
          if (response.data.data.length > 0) {
            const totalRating = response.data.data.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / response.data.data.length);
          } else {
            setAverageRating(5); // Default to 5 stars if no reviews
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchReviews();
    }
  }, [foodId, url]);

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Format date to display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="review-list-container">
      <div className="review-summary">
        <h3>Customer Reviews</h3>
        <div className="average-rating">
          <div className="rating-number">{averageRating.toFixed(1)}</div>
          {renderStars(averageRating)}
          <span className="review-count">({reviews.length} reviews)</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-reviews">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">No reviews yet. Be the first to review this item!</div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.userName || 'Anonymous'}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList; 