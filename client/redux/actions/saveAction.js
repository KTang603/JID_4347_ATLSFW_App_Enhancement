export const save = (articleId) => {
    // Debug logging
    console.log('Save action called with:', articleId);
    return {
      type: 'SAVE',
      payload: articleId.toString(),
    };
  };

export const unsave = (articleId) => {
    // Debug logging
    console.log('Unsave action called with:', articleId);
    return {
      type: 'UNSAVE',
      payload: articleId.toString(),
    };
  };

export const get_save_list = (articles) => {
  // Debug logging
  console.log('Get save list called with:', articles);
  // Ensure all IDs are strings
  const articleIds = Array.isArray(articles) 
    ? articles.map(id => id.toString())
    : [];
  return {
    type: 'GET_SAVE_LIST',
    payload: articleIds,
  };
};
