import { Alert } from 'react-native';
import { clearAll } from './StorageUtils';
import { CommonActions } from '@react-navigation/native';

// Flags to track if we've already shown the deactivation alert and navigated to login
let deactivationAlertShown = false;
let navigatedToLogin = false;

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
              // Navigate to login only if we haven't already
              if (navigation && !navigatedToLogin) {
                navigatedToLogin = true;
                navigation.dispatch(
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
              }
            }
          }
        ]
      );
    }
    
    return true; // Error was handled
  }
  
  // For other errors, just return false to let the caller handle it
  return false;
};

export default { handleApiError };
