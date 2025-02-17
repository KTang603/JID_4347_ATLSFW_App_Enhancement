const initialState = {
    saved_articles: [],
  };

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SAVE':
            return {
                ...state,
                saved_articles: [...(new Set([...state.saved_articles, action.payload]))],
              };
        case 'UNSAVE':
            const filtered = state.saved_articles.filter(id => id !== action.payload);
            return { 
                ...state, 
                saved_articles: filtered,
            };
        case 'GET_SAVE_LIST':
            return {
                ...state,
                saved_articles: action.payload,
                };
        default:
            return state;
    }
};
