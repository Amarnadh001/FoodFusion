import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://foodfusion-backend-lfj9.onrender.com";

console.log('API URL configured as:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData requests (file uploads)
    // Let the browser set it automatically with the boundary parameter
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
        config.params || (config.data instanceof FormData ? 'FormData' : config.data) || {});
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`📥 Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Detailed error logging
    console.error('❌ API Error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('📥 Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        console.error('🔒 Authentication error:', error.response.data.message);
        // Clear token if it's expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('📥 No response received:', error.request);
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Request timeout');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('📤 Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 