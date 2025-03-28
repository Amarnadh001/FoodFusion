import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import ReviewList from "../../components/ReviewList/ReviewList";
import "./FoodDetails.css";

const FoodDetails = () => {
  const { id } = useParams(); // Get the food ID from the URL
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url } = useContext(StoreContext);
  const [averageRating, setAverageRating] = useState(5); // Default to 5 stars

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await axios.get(`${url}/api/food/${id}`);
        if (response.data.success) {
          setFood(response.data.data);
        } else {
          setError("Food item not found");
        }
      } catch (error) {
        console.error("Error fetching food details:", error);
        setError("Failed to fetch food details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await axios.get(`${url}/api/review/food/${id}`);
        if (response.data.success && response.data.data.length > 0) {
          const reviews = response.data.data;
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviews.length);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchFoodDetails();
    fetchRatings();
  }, [id, url]);

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!food) {
    return <div className="error">No food item found.</div>;
  }

  return (
    <div className="food-details">
      <div className="food-header">
        <img src={`${url}/uploads/${food.image}`} alt={food.name} className="food-image" />
        <div className="food-info">
          <h1>{food.name}</h1>
          <div className="price-rating">
            <span className="price">₹{food.price}</span>
            <div className="rating">
              {renderStars(averageRating)}
              <span className="rating-count">({averageRating.toFixed(1)})</span>
            </div>
          </div>
          <p className="description">{food.description}</p>
        </div>
      </div>

      <div className="food-sections">
        <div className="section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {food.ingredients && food.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h2>Nutritional Information</h2>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="label">Calories</span>
              <span className="value">{food.calories || '250'} kcal</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Protein</span>
              <span className="value">{food.protein || '15'}g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Carbs</span>
              <span className="value">{food.carbs || '30'}g</span>
            </div>
            <div className="nutrition-item">
              <span className="label">Fat</span>
              <span className="value">{food.fat || '12'}g</span>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Health Benefits</h2>
          <p className="benefits">{food.Advantages}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewList foodId={id} />
    </div>
  );
};

export default FoodDetails;
