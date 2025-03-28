import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./FoodDetails.css";

const FoodDetails = () => {
  const { id } = useParams(); // Get the food ID from the URL
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/food/${id}`);
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
    fetchFoodDetails();
  }, [id]);

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
        <img src={`http://localhost:4000/uploads/${food.image}`} alt={food.name} className="food-image" />
        <div className="food-info">
          <h1>{food.name}</h1>
          <div className="price-rating">
            <span className="price">${food.price}</span>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="rating-count">(4.5)</span>
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
    </div>
  );
};

export default FoodDetails;
