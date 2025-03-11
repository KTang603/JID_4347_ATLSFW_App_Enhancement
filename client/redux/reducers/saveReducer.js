const initialState = {
    saved_articles: [],
  };

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SAVE':
            // Convert all IDs to strings
            const currentSaved = state.saved_articles.map(id => id.toString());
            const newArticleId = action.payload.toString();
            return {
                ...state,
                saved_articles: [...new Set([...currentSaved, newArticleId])],
            };
        case 'UNSAVE':
            // Convert all IDs to strings for comparison
            const filtered = state.saved_articles
                .map(id => id.toString())
                .filter(id => id !== action.payload.toString());
            return { 
                ...state, 
                saved_articles: filtered,
            };
        case 'GET_SAVE_LIST':
            // Ensure all IDs are strings
            const savedList = Array.isArray(action.payload) 
                ? action.payload.map(id => id.toString())
                : [];
            return {
                ...state,
                saved_articles: savedList,
            };
        default:
            return state;
    }
};
