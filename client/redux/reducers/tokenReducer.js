const initialState = {
  token: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'LOGOUT_AND_CLEAR_TOKEN':
      return {
        ...state,
        token: null,
      };
    default:
      return state;
  }
};
