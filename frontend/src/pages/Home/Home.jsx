import React, { useState, useEffect } from 'react';
import AppDownload from '../../components/AppDownload/AppDownload';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import Header from '../../components/Header/Header';
import './Home.css';

const Home = () => {
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Search for food...');

  const placeholders = [
    'Search for food...',
    'Yummy yummy....',
    'Craving something?',
    'What’s your hunger level?',
    'Find your favorite dish!',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderText((prev) => {
        const currentIndex = placeholders.indexOf(prev);
        const nextIndex = (currentIndex + 1) % placeholders.length;
        return placeholders[nextIndex];
      });
    }, 1000); // Change every 1 second

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <Header />
      {/* Add a single search input */}
      <input
        type="text"
        placeholder={placeholderText}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} searchTerm={searchTerm} />
      <AppDownload />
    </div>
  );
};

export default Home;
