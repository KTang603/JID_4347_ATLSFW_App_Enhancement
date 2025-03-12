const initialState = {
  userInfo: {
    hashed_email: "",
    hashed_password: "",
    encrypted_email: "",
    first_name: "",
    last_name: "",
    username: "",
    gender: "",
    phone_number: "",
    subscribed_to_news: false,
    birthday: "",
    user_id: "",
  },
  token:null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_INFO':
      return {
        ...state,
        userInfo: action.payload,
      };
      case 'UPDATE_USER_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
    default:
      return state;
  }
};