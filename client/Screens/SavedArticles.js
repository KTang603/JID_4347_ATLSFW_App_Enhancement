import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Modal,
  Button,
  StyleSheet,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import Icon from "react-native-vector-icons/FontAwesome";
import Article from "../components/Article";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector, useDispatch } from "react-redux";

const SavedArticles = ({ navigation }) => {
  const dispatch = useDispatch();
  // redux state
  const isLogged = useSelector((store) => store.isLogged.isLogged);

 

  const [isSavePressed, setSavePressed] = useState(false);
  const saved_articles_state = useSelector((store) => {
    // Debug logging
    console.log('SavedArticles: Redux store state:', store.saved_articles);
    return store.saved_articles.saved_articles;
  });

  // Debug logging for state changes
  useEffect(() => {
    console.log('SavedArticles: saved_articles_state changed:', saved_articles_state);
  }, [saved_articles_state]);

  const handleSavePress = () => {
    // Toggle the state when the Save button is pressed
    setSavePressed(!isSavePressed);
  };

  const [articleData, setArticleData] = useState();
  
  const token = useSelector((store) => store.token?.token);

  // Initial data load when token changes
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Refetch data when saved articles state changes
  useEffect(() => {
    if (token && saved_articles_state) {
      fetchData();
    }
  }, [saved_articles_state]);

  const fetchData = async () => {
    try {
      if (!token) {
        console.error('No token available for posts fetch');
        return;
      }

      // Get total number of articles first
      const countResponse = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/posts?limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const totalPages = countResponse.data.pagination.pages;
      let allArticles = [];

      // Fetch all pages
      for (let page = 1; page <= totalPages; page++) {
        const response = await axios.get(
          `http://${MY_IP_ADDRESS}:5050/posts?page=${page}&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        allArticles = [...allArticles, ...response.data.articles];
      }
      
      // Debug logging
      console.log('Saved articles state:', saved_articles_state);
      console.log('All articles:', allArticles.map(a => ({ id: a._id, title: a.article_title })));
      
      // Convert all IDs to strings for comparison
      const savedArticlesStr = saved_articles_state.map(id => id.toString());
      console.log('Saved articles as strings:', savedArticlesStr);
      
      const filteredData = allArticles.filter((article) => {
        const articleId = article._id.toString();
        const isIncluded = savedArticlesStr.includes(articleId);
        console.log(`Article ${articleId} (${article.article_title}) included: ${isIncluded}`);
        return isIncluded;
      });
      
      console.log('Filtered articles:', filteredData.map(a => ({ id: a._id, title: a.article_title })));
      setArticleData(filteredData);
    } catch (error) {
      console.error("Error during data fetch:", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {articleData && 
        <MasonryList
          numColumns={2}
          data={articleData}
          keyExtractor={(item) => item["_id"]}
          renderItem={({ item, index }) => (
            <Article
              article={{
                title: item["article_title"],
                image: item["article_preview_image"],
                author: item["author_name"],
                likes: item["like_count"],
                saves: item["save_count"],
                article_id: item["_id"].toString(),
                article_link: item["article_link"],
              }}
            ></Article>
          )}
        />
        }
      </View>
    </View>
  );
};

export default SavedArticles;
