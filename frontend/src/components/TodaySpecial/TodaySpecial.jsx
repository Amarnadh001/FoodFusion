import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './TodaySpecial.css';
import { motion } from 'framer-motion';

const TodaySpecial = () => {
  const { food_list } = useContext(StoreContext);

  // Filter special items
  const specialItems = food_list.filter(item => item.isSpecial);

  if (specialItems.length === 0) return null;

  return (
    <motion.div 
      className='today-special' 
      id='today-special'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='today-special-header'>
        <h2>Today's Special</h2>
        <motion.div 
          className='special-badge'
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Special Offers
        </motion.div>
      </div>
      <div className='today-special-list'>
        {specialItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <FoodItem 
              id={item._id} 
              name={item.name} 
              description={item.description} 
              price={item.price} 
              image={item.image}
              imageUrl={item.imageUrl}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TodaySpecial;