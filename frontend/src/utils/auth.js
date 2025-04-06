/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The authentication token to store
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get the user ID from localStorage
 * @returns {string|null} The user ID or null if not found
 */
export const getUserId = () => {
  return localStorage.getItem('userId');
};

/**
 * Set the user ID in localStorage
 * @param {string} userId - The user ID to store
 */
export const setUserId = (userId) => {
  localStorage.setItem('userId', userId);
};

/**
 * Remove the user ID from localStorage
 */
export const removeUserId = () => {
  localStorage.removeItem('userId');
};

/**
 * Log out the user by removing all authentication data
 */
export const logout = () => {
  removeToken();
  removeUserId();
}; 