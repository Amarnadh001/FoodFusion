// src/components/FoodList.jsx
import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from './FoodItem';
import './FoodList.css';

const FoodList = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter food items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="food-list">
      {/* Single Search Bar */}
      <input
        type="text"
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="food-items">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <FoodItem key={item.id} {...item} />
          ))
        ) : (
          <p>No matching items found.</p>
        )}
      </div>
    </div>
  );
};

export default FoodList;
