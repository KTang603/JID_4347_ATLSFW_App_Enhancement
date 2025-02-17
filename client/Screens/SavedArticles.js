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
import { useSelector } from "react-redux";

const SavedArticles = ({ navigation }) => {
  // redux state
  const isLogged = useSelector((store) => store.isLogged.isLogged);

  if (!isLogged) {
    navigation.reset({ index: 0, routes: [{ name: 'Log In' }], });
  }

  const [isSavePressed, setSavePressed] = useState(false);
  const saved_articles_state = useSelector(
    (store) => store.saved_articles.saved_articles
  );

  const handleSavePress = () => {
    // Toggle the state when the Save button is pressed
    setSavePressed(!isSavePressed);
  };

  const [articleData, setArticleData] = useState();
  
  const token = useSelector((store) => store.token?.token);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.error('No token available for posts fetch');
          return;
        }

        const response = await axios.get(
          "http://" + MY_IP_ADDRESS + ":5050/posts",
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const filteredData = response.data.articles.filter((article) =>
          saved_articles_state.includes(article._id)
        );
        setArticleData(filteredData);
      } catch (error) {
        console.error("Error during data fetch:", error.message);
      }
    }; 
    if (token) {
      fetchData();
    }
  }, [token, saved_articles_state]);

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
                article_id: item["_id"],
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
