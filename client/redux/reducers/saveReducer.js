const initialState = {
  articles: [],
  progress: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_SAVE_ARTCILES_LIKE":
      const articleId = action.payload;
      const updatedArticles = state.articles.map((item) => {
        if (item._id === articleId) {
          return {
            ...item,
            is_liked: !item.is_liked,
            like_count: !item.is_liked
              ? item.like_count + 1
              : item.like_count - 1,
          };
        }
        return item;
      });

      return {
        ...state,
        articles: updatedArticles,
        isProgress: false,
      };
    case "UPDATE_SAVE_ARTCILES_SAVE":
      const selectedId = action.payload;
      const updatedSavedArticles = state.articles.filter((item) => {
        return item._id != selectedId;
      });

      return {
        ...state,
        articles: updatedSavedArticles,
        isProgress: false,
      };
    case "GET_SAVE_LIST":
      return {
        ...state,
        articles: action.payload,
        progress: false,
      };

    case "GET_SAVE_LIST_PROGRESS":
      return {
        ...state,
        progress: true,
      };
    case "GET_SAVE_LIST_FAILURE":
      return {
        ...state,
        progress: false,
      };
    default:
      return state;
  }
};
