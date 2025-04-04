import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { handleApiError } from "../../utils/ApiErrorHandler";

// Action Types
export const HOME_DATA_REQUEST = 'HOME_DATA_REQUEST';
export const HOME_DATA_SUCCESS = 'HOME_DATA_SUCCESS';
export const HOME_DATA_FAILURE = 'HOME_DATA_FAILURE';

// Action Creators
export const fetchHomeData = (token, navigation) => async (dispatch) => {
  // Check if token exists
  if (!token) {
    dispatch({ 
      type: HOME_DATA_FAILURE, 
      payload: 'Authentication token not found' 
    });
    
    // Redirect to login
    navigation.replace("Log In");
    return;
  }

  try {
    dispatch({ type: HOME_DATA_REQUEST });
    
    const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/home/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      // Mock data for featured brands (as in the original HomeScreen)
      const mockBrands = [
        {
          _id: "1",
          name: "EcoThreads",
          description: "Sustainable clothing made from recycled materials",
          image: "https://example.com/brand1.jpg",
        },
        {
          _id: "2",
          name: "Green Stitch",
          description: "Handcrafted accessories using eco-friendly materials",
          image: "https://example.com/brand2.jpg",
        },
        {
          _id: "3",
          name: "Terra Wear",
          description: "Biodegradable fashion for conscious consumers",
          image: "https://example.com/brand3.jpg",
        },
      ];
      
      dispatch({
        type: HOME_DATA_SUCCESS,
        payload: {
          upcomingEvents: response.data.upcomingEvents || [],
          featuredBrands: mockBrands,
          workshops: response.data.workshops || [],
          featuredTicketEvent: response.data.featuredTicketEvent || null
        }
      });
    }
  } catch (error) {
    const errorHandled = await handleApiError(error, navigation);
    
    if (!errorHandled) {
      dispatch({
        type: HOME_DATA_FAILURE,
        payload: error.message
      });
      
      // Set mock data for brands as fallback (as in the original HomeScreen)
      const mockBrands = [
        {
          _id: "1",
          name: "EcoThreads",
          description: "Sustainable clothing made from recycled materials",
          image: "https://example.com/brand1.jpg",
        },
        {
          _id: "2",
          name: "Green Stitch",
          description: "Handcrafted accessories using eco-friendly materials",
          image: "https://example.com/brand2.jpg",
        },
        {
          _id: "3",
          name: "Terra Wear",
          description: "Biodegradable fashion for conscious consumers",
          image: "https://example.com/brand3.jpg",
        },
      ];
      
      dispatch({
        type: HOME_DATA_SUCCESS,
        payload: {
          upcomingEvents: [],
          featuredBrands: mockBrands,
          workshops: [],
          featuredTicketEvent: null
        }
      });
    }
  }
};
