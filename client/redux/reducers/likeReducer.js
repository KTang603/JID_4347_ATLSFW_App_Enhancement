const initialState = {
    liked_articles: [],
  };

export default (state = initialState, action) => {
    switch (action.type) {
        case 'LIKE':
            return {
                ...state,
                liked_articles: [...(new Set([...state.liked_articles, action.payload]))],
                // liked_articles: [...state.liked_articles, action.payload],
              };
        case 'UNLIKE':
            const filtered = state.liked_articles.filter(id => id !== action.payload);
            return { 
                ...state, 
                liked_articles: filtered,
            };
        case 'GET_LIKE_LIST':
            return {
                ...state,
                liked_articles: action.payload,
                };
        default:
            return state;
    }
};
