import {
  HOME_DATA_REQUEST,
  HOME_DATA_SUCCESS,
  HOME_DATA_FAILURE
} from '../actions/homeAction';

const initialState = {
  upcomingEvents: [],
  featuredBrands: [],
  workshops: [],
  featuredTicketEvent: null,
  loading: false,
  error: null,
  authError: false
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOME_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case HOME_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        upcomingEvents: action.payload.upcomingEvents,
        featuredBrands: action.payload.featuredBrands,
        workshops: action.payload.workshops,
        featuredTicketEvent: action.payload.featuredTicketEvent
      };
    case HOME_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        authError: action.payload === 'Authentication token not found' || 
                  action.payload.includes('authentication') || 
                  action.payload.includes('token') || 
                  action.payload.includes('unauthorized')
      };
    default:
      return state;
  }
};

export default homeReducer;
