import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { handleApiError } from "../../utils/ApiErrorHandler";

// Action Types
export const HOME_DATA_REQUEST = 'HOME_DATA_REQUEST';
export const HOME_DATA_SUCCESS = 'HOME_DATA_SUCCESS';
export const HOME_DATA_FAILURE = 'HOME_DATA_FAILURE';

// Action Creators
export const fetchHomeData = (token) => async (dispatch) => {
  
  try {
    dispatch({ type: HOME_DATA_REQUEST });
    
    const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/home/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      dispatch({
        type: HOME_DATA_SUCCESS,
        payload: {
          upcomingEvents: response.data.upcomingEvents || [],
          featuredBrands: response.data.featuredBrands || [],
          workshops: response.data.workshops || [],
          featuredTicketEvent: response.data.featuredTicketEvent || null
        }
      });
    }
  } catch (error) {
    const errorHandled = await handleApiError(error);
    
    if (!errorHandled) {
      dispatch({
        type: HOME_DATA_FAILURE,
        payload: error.message
      });
      
      // Just dispatch the failure, don't use mock data
      // This will show "Brands coming soon" message in the UI
    }
  }
};
