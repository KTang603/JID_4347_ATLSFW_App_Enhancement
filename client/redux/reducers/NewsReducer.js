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
