const initialState = {
  isProgress: false,
  articles: [],
  pagination: {},
  tags: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "NEWS_DATA_FULFILLED":
      let oldArticles = state.articles;
      const { pagination, articles } = action.payload;
      const { page } = pagination;

      if (page > 1) {
        oldArticles = [...oldArticles, ...articles];
      } else {
        oldArticles = [...articles];
      }

      return {
        ...state,
        pagination: pagination,
        articles: oldArticles,
        isProgress: false,
      };

    case "UPDATE_NEWS_LIKE":
      const articleId = action.payload;
      const updatedArticles = state.articles.map((item) => {
        if (item._id === articleId) {
          return {
            ...item,
            is_liked: !item.is_liked,
            like_count: !item.is_liked ? item.like_count + 1 : item.like_count - 1,
          };
        }
        return item;
      });

      return {
        ...state,
        articles: updatedArticles,
        isProgress: false,
      };

    case "UPDATE_NEWS_SAVE":
      const updatedSavedArticles = state.articles.map((item) => {
        if (item._id === action.payload) {
          return {
            ...item,
            is_saved: !item.is_saved,
            save_count: !item.is_saved ? item.save_count + 1 : item.save_count - 1,
          };
        }
        return item;
      });
      return {
        ...state,
        articles: updatedSavedArticles,
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
