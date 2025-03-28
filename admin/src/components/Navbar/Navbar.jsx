import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear admin data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className='navbar'>
      <img src={assets.logo} alt="logo" className='logo' />
      <div className="nav-right">
        <button onClick={handleLogout} className="logout-btn">
          <img src={assets.logout_icon} alt="logout" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;

