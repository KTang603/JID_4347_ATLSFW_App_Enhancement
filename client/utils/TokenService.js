import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';

// Constants for AsyncStorage keys
const USER_TOKEN_KEY = 'userToken';
const USER_ID_KEY = 'userId';
const ACCOUNT_TYPE_KEY = 'accountType';

// Flag to track if we've already shown the deactivation alert
let deactivationAlertShown = false;
let navigatedToLogin = false;

// Global navigation reference
let navigationRef = null;

/**
 * TokenService - A centralized service for handling all token-related operations
 * 
 * This service provides methods for:
 * - Storing and retrieving tokens
 * - Setting up axios interceptors for automatic token inclusion
 * - Handling token validation errors, especially for deactivated accounts
 * 
 * Note: In the current implementation, tokens do not have an expiration time.
 * The JWT token is generated without an 'expiresIn' option in server/routes/login.mjs,
 * which means the token will never expire. If token expiration is implemented in the future,
 * this service will need to be updated to handle token refresh.
 */
class TokenService {
  constructor() {
    this.setupInterceptors();
  }

  /**
   * Set up axios interceptors for automatic token inclusion and error handling
   */
  setupInterceptors() {
    // Request interceptor - automatically add token to all requests
    axios.interceptors.request.use(
      async (config) => {
        // Don't add token to auth endpoints (login, signup)
        if (config.url && (config.url.includes('/login') || config.url.includes('/signup'))) {
          return config;
        }
        
        const token = await this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token validation errors
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Check if the error is from a deactivated account
        if (error.response && 
            error.response.status === 403 && 
            error.response.data && 
            error.response.data.code === 'ACCOUNT_DEACTIVATED') {
          
          await this.handleDeactivatedAccount();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set the navigation reference for use in navigation actions
   * @param {object} navigation - The navigation object
   */
  setNavigationRef(navigation) {
    navigationRef = navigation;
    console.log('Navigation reference set in TokenService');
  }

  /**
   * Handle deactivated account error
   * @param {object} navigation - The navigation object for redirecting (optional)
   */
  async handleDeactivatedAccount(navigation) {
    // Clear all stored user data
    await this.clearAll();
    
    // Use provided navigation or global navigation reference
    const nav = navigation || navigationRef;
    
    // Only show the alert if we haven't shown it already
    if (!deactivationAlertShown) {
      deactivationAlertShown = true;
      
      // Show an alert to the user
      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated by an administrator. Please contact support for more information.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login only if we haven't already and navigation is available
              if (nav && !navigatedToLogin) {
                navigatedToLogin = true;
                
                // Use a timeout to ensure the alert is dismissed before navigation
                setTimeout(() => {
                  nav.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Log In' }],
                    })
                  );
                  
                  // Reset the flags after a delay to allow for future deactivation alerts
                  setTimeout(() => {
                    deactivationAlertShown = false;
                    navigatedToLogin = false;
                  }, 5000);
                }, 300);
              } else {
                console.error('Navigation not available for redirect after account deactivation');
                // Reset flags even if navigation failed
                setTimeout(() => {
                  deactivationAlertShown = false;
                  navigatedToLogin = false;
                }, 5000);
              }
            }
          }
        ]
      );
    }
  }

  /**
   * Store user token in AsyncStorage
   * @param {string} token - The JWT token to store
   */
  async setToken(token) {
    try {
      await AsyncStorage.setItem(USER_TOKEN_KEY, token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get user token from AsyncStorage
   * @returns {Promise<string|null>} The stored token or null if not found
   */
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store user ID in AsyncStorage
   * @param {string} userId - The user ID to store
   */
  async setUserId(userId) {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      console.log('User ID stored successfully');
    } catch (error) {
      console.error('Error storing user ID:', error);
    }
  }

  /**
   * Get user ID from AsyncStorage
   * @returns {Promise<string|null>} The stored user ID or null if not found
   */
  async getUserId() {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      return userId;
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  }

  /**
   * Store account type in AsyncStorage
   * @param {string} accountType - The account type to store
   */
  async setAccountType(accountType) {
    try {
      await AsyncStorage.setItem(ACCOUNT_TYPE_KEY, accountType);
      console.log('Account type stored successfully');
    } catch (error) {
      console.error('Error storing account type:', error);
    }
  }

  /**
   * Get account type from AsyncStorage
   * @returns {Promise<string|null>} The stored account type or null if not found
   */
  async getAccountType() {
    try {
      const accountType = await AsyncStorage.getItem(ACCOUNT_TYPE_KEY);
      return accountType;
    } catch (error) {
      console.error('Error retrieving account type:', error);
      return null;
    }
  }

  /**
   * Clear all stored data from AsyncStorage
   */
  async clearAll() {
    try {
      await AsyncStorage.clear();
      console.log('All storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if user is authenticated (has a token)
   * @returns {Promise<boolean>} True if user has a token, false otherwise
   */
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Store all user auth data at once
   * @param {object} authData - Object containing token, userId, and accountType
   */
  async setAuthData(authData) {
    try {
      const { token, userId, accountType } = authData;
      
      // Create a batch operation
      const keyValuePairs = [
        [USER_TOKEN_KEY, token],
        [USER_ID_KEY, userId],
        [ACCOUNT_TYPE_KEY, accountType]
      ];
      
      await AsyncStorage.multiSet(keyValuePairs);
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }
}

// Create a singleton instance
const tokenService = new TokenService();

export default tokenService;
