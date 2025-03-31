import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { getUserToken } from "../../utils/StorageUtils";
import { ARTICLE_LIKE_API, ARTICLE_SAVE_API, CREATE_ARTICLE_API } from "../../utils/ApiUtils";
import { updatSaveNewsSave, updateSaveNewsLike } from "./saveAction";
import { handleApiError } from "../../utils/ApiErrorHandler";

export const fetchData =  (page = 1,inputTag,token,navigation) => async (dispatch, getState) => {
    try {
        dispatch(newsDataProgress())        
        const response = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/posts?tags=${inputTag.join(",")}&page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const {articles,pagination} = response.data
      dispatch(newsDataFullFilled({articles,pagination}))
    } catch (error) {
        dispatch(newsDataFailure())
        handleApiError(error,navigation)
    }
  };


  export const createArticle = async (articleTitle,articleImage,articleLink,userInfo,authorPfpLink,tags)=>{ 
    const payload = {
      article_title: articleTitle,
      article_preview_image: articleImage,
      article_link: articleLink,
      author_id: userInfo["_id"],
      author_name: userInfo["first_name"] + " " + userInfo["last_name"],
      author_pfp_link: authorPfpLink,
      tags: tags.split(",").map((tag) => tag.trim()),
    };
     const response = await axios.post(CREATE_ARTICLE_API, payload);
      return response;
  }




  export const newsDataFullFilled = (newsData) => {
    // Debug logging
    return {
      type: 'NEWS_DATA_FULFILLED',
      payload:newsData,
    };
  };

  export const newsDataProgress = () => {
    // Debug logging
    return {
      type: 'NEWS_DATA_PROGRESS',
    };
  };

  export const newsDataFailure = () => {
    // Debug logging
    return {
      type: 'NEWS_DATA_FAILURE',
    };
  };

  export const updateNewsLike = (articleId) => {
    return {
      type: 'UPDATE_NEWS_LIKE',
      payload:articleId,
    };
  };

  export const updatNewsSave = (articleId) => {
    return {
      type: 'UPDATE_NEWS_SAVE',
      payload:articleId,
    };
  };

  export const handleLike = (request) => async (dispatch,getState) => {
    try {
      const response = await axios.post(
        ARTICLE_LIKE_API,
        { user_id: request.user_id, article_id: request.articles_id },
        {
          headers: {
            Authorization: `Bearer ${request.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status) {
        await dispatch(updateSaveNewsLike(request.articles_id))
        await dispatch(updateNewsLike(request.articles_id))
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };


  export const handleSave = (request) => async (dispatch,getState) => {    
    try {
      const response = await axios.post(
        ARTICLE_SAVE_API,
        { user_id: request.user_id, article_id: request.articles_id },
        {
          headers: {
            Authorization: `Bearer ${request.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status) {
        console.log("response----" + JSON.stringify(request.articles_id));
         await dispatch(updatNewsSave(request.articles_id))
         await dispatch(updatSaveNewsSave(request.articles_id))

      }
    } catch (error) {
      console.error("Error updating like status:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };



  export const fetchTags =  (token) => async (dispatch,getState) => {
    try {
      const url = `http://${MY_IP_ADDRESS}:5050/tags`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('fetchTags-----'+JSON.stringify(response.data));
      if (response.data && Array.isArray(response.data)) {
        dispatch(tagsFullFilled(response.data))
      }
    } catch (error) {
      console.error("Error fetching tags:", error.message);
    }
  };

  export const tagsFullFilled = (tags) => {
    // Debug logging
    return {
      type: 'TAGS_FULFILLED',
      payload:tags,
    };
  };