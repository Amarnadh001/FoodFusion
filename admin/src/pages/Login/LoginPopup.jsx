import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

const sendOtp = async (userData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('OTP error:', error.response?.data || error.message);
    throw error;
  }
};