import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import "./FoodItem.css";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(5); // Default to 5 stars

  useEffect(() => {
    // Fetch average rating for this food item
    const fetchRating = async () => {
      try {
        const response = await axios.get(`${url}/api/review/food/${id}`);
        if (response.data.success && response.data.data.length > 0) {
          const reviews = response.data.data;
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviews.length);
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    fetchRating();
  }, [id, url]);

  const handleFoodClick = () => {
    navigate(`/food/${id}`); // Navigate to the FoodDetails page
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(id);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    removeFromCart(id);
  };

  // Render stars based on average rating
  const renderStars = () => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= averageRating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="food-item">
      <div className="food-item-img-container" onClick={handleFoodClick}>
        <img
          src={`${url}/uploads/${image}`}
          alt={name}
          className="food-item-image"
        />
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt="Add to Cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={handleRemoveFromCart}
              src={assets.remove_icon_red}
              alt="Remove from Cart"
            />
            <p>{cartItems[id]}</p>
            <img
              onClick={handleAddToCart}
              src={assets.add_icon_green}
              alt="Add to Cart"
            />
          </div>
        )}
      </div>
      <div className="food-item-info" onClick={handleFoodClick}>
        <div className="food-item-name-rating">
          <p>{name}</p>
          {renderStars()}
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">₹{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
