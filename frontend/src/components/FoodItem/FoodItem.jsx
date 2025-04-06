import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import "./FoodItem.css";

const FoodItem = ({ id, name, price, description, image, imageUrl, isCombo }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(5); // Default to 5 stars
  const [showComboDetails, setShowComboDetails] = useState(false);

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
    if (isCombo) {
      setShowComboDetails(!showComboDetails);
    } else {
      navigate(`/food/${id}`); // Navigate to the FoodDetails page
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event from bubbling up
    addToCart(id);
  };

  const handleRemoveFromCart = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event from bubbling up
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
  
  // Use either imageUrl or image, depending on which is available
  const imagePath = imageUrl || image;

  return (
    <div className="food-item">
      {isCombo && description && (
        <div className={`combo-description ${showComboDetails ? 'visible' : ''}`}>
          <h3>Combo Details</h3>
          <p>{description}</p>
        </div>
      )}
      <div className="food-item-img-container" onClick={handleFoodClick}>
        <img
          src={imagePath && (imagePath.startsWith('http') || imagePath.startsWith('data:')) ? imagePath : `${url}/uploads/${imagePath || 'placeholder.jpg'}`}
          alt={name}
          className="food-item-image"
          onError={(e) => {
            console.log(`Failed to load image: ${e.target.src}`);
            // First try to load a placeholder image from the server
            e.target.src = `${url}/uploads/placeholder.jpg`;
            // If that fails, use a data URI as fallback
            e.target.onerror = () => {
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
              e.target.onerror = null; // Prevent infinite loop
            };
          }}
        />
        <div className={`cart-controls ${isCombo ? 'combo' : ''}`}>
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
