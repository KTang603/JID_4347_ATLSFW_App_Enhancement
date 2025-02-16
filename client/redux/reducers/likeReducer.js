const initialState = {
    liked_articles: [],
};

export default (state = initialState, action) => {
    // Debug logging
    console.log('likeReducer:', {
        type: action.type,
        payload: action.payload,
        currentState: state
    });

    switch (action.type) {
        case 'LIKE':
            // Convert all IDs to strings
            const currentLiked = state.liked_articles.map(id => id.toString());
            const newArticleId = action.payload.toString();
            const newLikedState = [...new Set([...currentLiked, newArticleId])];
            
            console.log('LIKE:', {
                currentLiked,
                newArticleId,
                newState: newLikedState
            });
            
            return {
                ...state,
                liked_articles: newLikedState,
            };
            
        case 'UNLIKE':
            // Convert all IDs to strings for comparison
            const currentIds = state.liked_articles.map(id => id.toString());
            const targetId = action.payload.toString();
            const filtered = currentIds.filter(id => id !== targetId);
            
            console.log('UNLIKE:', {
                currentIds,
                targetId,
                filtered
            });
            
            return { 
                ...state, 
                liked_articles: filtered,
            };
            
        case 'GET_LIKE_LIST':
            // Ensure all IDs are strings
            const likedList = Array.isArray(action.payload) 
                ? action.payload.map(id => id.toString())
                : [];
                
            console.log('GET_LIKE_LIST:', {
                payload: action.payload,
                likedList
            });
            
            return {
                ...state,
                liked_articles: likedList,
            };
        default:
            return state;
    }
};
