import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import './FoodDisplay.css'

const FoodDisplay = ({ category, searchTerm }) => {
  const { food_list } = useContext(StoreContext);

  const filteredFoods = food_list.filter((item) => 
    (category === "All" || item.category === category) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item, index) => (
            <FoodItem 
              key={index} 
              id={item._id} 
              name={item.name} 
              description={item.description} 
              price={item.price} 
              image={item.image} 
            />
          ))
        ) : (
          <p>No food items match your search.</p>
        )}
      </div>
    </div>
  );
};


export default FoodDisplay
