import { Alert } from 'react-native';
import { clearAll } from './StorageUtils';
import { CommonActions } from '@react-navigation/native';

/**
 * Handles API errors, with special handling for deactivated accounts
 * @param {Error} error - The error object from the API call
 * @param {object} navigation - The navigation object for redirecting
 * @returns {boolean} - True if the error was handled, false otherwise
 */
export const handleApiError = async (error, navigation) => {
  // Check if the error is from a deactivated account
  if (error.response && 
      error.response.status === 403 && 
      error.response.data && 
      error.response.data.code === 'ACCOUNT_DEACTIVATED') {
    
    // Clear all stored user data
    await clearAll();
    
    // Show an alert to the user
    Alert.alert(
      'Account Deactivated',
      'Your account has been deactivated by an administrator. Please contact support for more information.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset navigation stack and redirect to login
            if (navigation) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Log In' }],
                })
              );
            }
          }
        }
      ]
    );
    
    return true; // Error was handled
  }
  
  // For other errors, just return false to let the caller handle it
  return false;
};

export default { handleApiError };
