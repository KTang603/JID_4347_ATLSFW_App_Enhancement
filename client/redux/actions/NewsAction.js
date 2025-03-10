import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { getUserToken } from "../../utils/StorageUtils";
import { CREATE_ARTICLE_API } from "../../utils/ApiUtils";

export const fetchData = (page = 1, loadMore = false, tags = [], dateParams = {}) => {
  return async (dispatch, getState) => {
    const { startDate, endDate } = dateParams;
    const dateQuery = [];
    if (startDate) dateQuery.push(`startDate=${startDate}`);
    if (endDate) dateQuery.push(`endDate=${endDate}`);
    
    const response = await axios.get(
      `http://${MY_IP_ADDRESS}:5050/posts?tags=${tags.join(",")}&page=${page}&limit=20${dateQuery.length ? '&' + dateQuery.join('&') : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${await getUserToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    //response.data.articles
    const {articles} = response.data
    dispatch(newsDataFullFilled(articles))
  };
};

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

export const fetchTags =  (token) => async (dispatch,getState) => {
  try {
    const url = `http://${MY_IP_ADDRESS}:5050/tags`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
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