import { getUserToken } from './StorageUtils';

/**
 * Gets the authentication token from Redux or AsyncStorage
 * @param {Object} reduxToken - The token from Redux state
 * @returns {Promise<string|null>} The authentication token or null if not available
 */
export const getAuthToken = async (reduxToken) => {
  // If token exists in Redux, use it
  if (reduxToken) {
    return reduxToken;
  }
  
  // Otherwise try to get from AsyncStorage
  try {
    const storedToken = await getUserToken();
    return storedToken;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Checks if a token exists and is potentially valid
 * @param {string} token - The token to check
 * @returns {boolean} Whether the token exists and is potentially valid
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  // Basic check - a JWT token should have at least 2 dots
  // This doesn't verify the token, just checks if it's formatted like a JWT
  return token.split('.').length === 3;
};