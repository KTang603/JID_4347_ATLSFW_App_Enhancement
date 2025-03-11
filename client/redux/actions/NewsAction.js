import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { getUserToken } from "../../utils/StorageUtils";
import { CREATE_ARTICLE_API } from "../../utils/ApiUtils";

export const fetchData =  (page = 1, loadMore = false,inputTag) => async (dispatch, getState) => {
    try {
        const state = getState();
        const token = await getUserToken();
        dispatch(newsDataProgress())
    //   setIsLoading(true);
      const response = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/posts?tags=${inputTag.join(",")}&page=${page}&limit=80`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      //response.data.articles
      const {articles} = response.data
      dispatch(newsDataFullFilled(articles))



    // console.log('response-----'+JSON.stringify(response.data));
     

    //   const articles = response.data.articles.map(article => ({
    //     ...article,
    //     _id: article._id?.toString() || '',
    //     author_id: article.author_id?.toString() || ''
    //   }));

    } catch (error) {
        dispatch(newsDataFailure())

      console.error("Error during data fetch:", error.message);
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