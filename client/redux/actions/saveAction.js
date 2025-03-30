import axios from "axios";
import { ARTICLE_SAVED_API } from "../../utils/ApiUtils";

export const getSavedArticles =
  (token, id) => async (dispatch, getState) => {
    try {
      dispatch(get_save_list_progress())
      const response = await axios({
        method: "POST",
        url: ARTICLE_SAVED_API,
        data: {
          user_id:id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log('====================================');
      console.log('SAVE----'+JSON.stringify(response));
      console.log('====================================');
      const {data,status}= response;
      if(status){
        dispatch(get_save_list(data.data))
      }
    } catch (error) {
      dispatch(get_save_list_failure())
      console.error("Error fetching tags:", error.message);
    }
  };

export const save = (articleId) => {
  // Debug logging
  console.log("Save action called with:", articleId);
  return {
    type: "SAVE",
    payload: articleId.toString(),
  };
};

export const unsave = (articleId) => {
  // Debug logging
  console.log("Unsave action called with:", articleId);
  return {
    type: "UNSAVE",
    payload: articleId.toString(),
  };
};


export const get_save_list_progress = () => {  
  return {
    type: "GET_SAVE_LIST_PROGRESS",
  };
};

export const get_save_list_failure = () => {  
  return {
    type: "GET_SAVE_LIST_FAILURE",
  };
};

export const get_save_list = (articles) => {  
  return {
    type: "GET_SAVE_LIST",
    payload: articles,
  };
};


export const updateSaveNewsLike = (articleId) => {
  return {
    type: 'UPDATE_SAVE_ARTCILES_LIKE',
    payload:articleId,
  };
};

export const updatSaveNewsSave = (articleId) => {
  return {
    type: 'UPDATE_SAVE_ARTCILES_SAVE',
    payload:articleId,
  };
};