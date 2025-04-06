import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import ComboDetails from '../ComboDetails/ComboDetails';
import './Combos.css';
import { motion } from 'framer-motion';
import axios from 'axios';

const Combos = () => {
  const { url } = useContext(StoreContext);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await axios.get(`${url}/api/combo/list`);
        if (response.data.success) {
          setCombos(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching combos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [url]);

  if (loading) return null;
  if (combos.length === 0) return null;

  return (
    <motion.div 
      className='combos' 
      id='combos'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='combos-header'>
        <h2>Special Combos</h2>
        <motion.div 
          className='combo-badge'
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Combo Offers
        </motion.div>
      </div>
      <div className='combos-list'>
        {combos.map((combo, index) => (
          <motion.div
            key={combo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div onClick={() => setSelectedCombo({ ...combo, url })}>
              <FoodItem 
                id={combo._id} 
                name={combo.name} 
                description={combo.description} 
                price={combo.price} 
                image={combo.coverImage}
                imageUrl={combo.coverImage || combo.imageUrl}
                isCombo={true}
              />
            </div>
          </motion.div>
        ))}
      </div>
      {selectedCombo && (
        <ComboDetails 
          combo={selectedCombo} 
          onClose={() => setSelectedCombo(null)} 
        />
      )}
    </motion.div>
  );
};

export default Combos;