export const like = (articleId) => {
    // Debug logging
    console.log('Like action called with:', articleId);
    return {
      type: 'LIKE',
      payload: articleId.toString(),
    };
  };

export const unlike = (articleId) => {
    // Debug logging
    console.log('Unlike action called with:', articleId);
    return {
      type: 'UNLIKE',
      payload: articleId.toString(),
    };
  };

export const get_like_list = (articles) => {
  // Debug logging
  console.log('Get like list called with:', articles);
  // Ensure all IDs are strings
  const articleIds = Array.isArray(articles) 
    ? articles.map(id => id.toString())
    : [];
  return {
    type: 'GET_LIKE_LIST',
    payload: articleIds,
  };
};
