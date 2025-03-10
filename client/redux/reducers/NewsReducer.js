const initialState = {
  isProgress: false,
  articles: [],
  tags:[],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "NEWS_DATA_FULFILLED":
      return {
        ...state,
        articles: action.payload,
        isProgress: false,
      };
    case "NEWS_DATA_PROGRESS":
      return {
        ...state,
        isProgress: true,
      };
    case "NEWS_DATA_FAILURE":
      return {
        ...state,
        isProgress: false,
      };

      case "TAGS_FULFILLED":
        return {
          ...state,
          tags: action.payload,
        };
    default:
      return state;
  }
};
