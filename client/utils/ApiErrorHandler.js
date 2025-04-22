import tokenService from './TokenService';

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
    
    // Use TokenService to handle deactivated account
    await tokenService.handleDeactivatedAccount(navigation);
    
    return true; // Error was handled
  }
  
  // For other errors, just return false to let the caller handle it
  return false;
};

export default { handleApiError };
