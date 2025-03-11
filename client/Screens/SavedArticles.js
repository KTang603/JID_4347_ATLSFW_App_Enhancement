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
  Alert,
  ActivityIndicator,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import Icon from "react-native-vector-icons/FontAwesome";
import Article from "../components/Article";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector, useDispatch } from "react-redux";
import { getAuthToken } from "../utils/TokenUtils";
import { setToken } from "../redux/actions/tokenAction";

const SavedArticles = ({ navigation }) => {
  const dispatch = useDispatch();
  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const [isSavePressed, setSavePressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const saved_articles_state = useSelector((store) => {
    console.log('SavedArticles: Redux store state:', store.saved_articles);
    return store.saved_articles.saved_articles;
  });

  const [articleData, setArticleData] = useState();
  
  // Get token from Redux
  const reduxToken = useSelector((store) => store.token?.token);

  // Initial data load
  useEffect(() => {
    loadSavedArticles();
  }, []);

  // Refetch data when saved articles state changes
  useEffect(() => {
    if (saved_articles_state) {
      loadSavedArticles();
    }
  }, [saved_articles_state]);

  const loadSavedArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If no token is available, navigate to login
      if (!token) {
        console.log('No authentication token available');
        setIsLoading(false);
        
        Alert.alert(
          "Authentication Required",
          "Please log in to view saved articles",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Log In')
            }
          ]
        );
        return;
      }
      
      // If token exists but isn't in Redux, update Redux
      if (!reduxToken && token) {
        dispatch(setToken(token));
      }
      
      // Fetch data
      await fetchData(token);
      
    } catch (error) {
      console.error("Error loading saved articles:", error);
      setError("Failed to load saved articles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (token) => {
    try {
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
      
      // Convert all IDs to strings for comparison
      const savedArticlesStr = saved_articles_state.map(id => id.toString());
      
      const filteredData = allArticles.filter((article) => {
        const articleId = article._id.toString();
        return savedArticlesStr.includes(articleId);
      });
      
      setArticleData(filteredData);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Log In')
            }
          ]
        );
      } else {
        console.error("Error during data fetch:", error.message);
        setError("Failed to load articles. Please try again.");
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadSavedArticles}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#02833D" />
        ) : articleData && articleData.length > 0 ? (
          <MasonryList
            numColumns={2}
            data={articleData}
            keyExtractor={(item) => item["_id"]}
            renderItem={({ item }) => (
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
              />
            )}
          />
        ) : (
          <Text style={styles.noArticlesText}>No saved articles found</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#02833D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  noArticlesText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default SavedArticles;
