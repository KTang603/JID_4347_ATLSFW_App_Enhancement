import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import Icon from "react-native-vector-icons/FontAwesome";
import Article from "../components/Article";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../redux/actions/NewsAction";
import { getAuthToken } from "../utils/TokenUtils";
import { setToken } from "../redux/actions/tokenAction";

const NewsFeedScreen = ({ navigation }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const newsData = useSelector(state => state.news);
  const {articles, isProgress, tags} = newsData;
  const [inputTag, setInputTag] = useState([]);
  const dispatch = useDispatch();
  const reduxToken = useSelector((state) => state.token.token);

  const [articleData, setArticleData] = useState({ articles: [], pagination: { page: 1, pages: 1 } });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If no token is available, navigate to login
      if (!token) {
        console.log('No authentication token available');
        
        Alert.alert(
          "Authentication Required",
          "Please log in to view news feed",
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
      
      // Fetch data using the token
      dispatch(fetchData(1, true, inputTag));
      
      // Fetch user liked and saved articles
      await fetchUserLikedAndSavedArticles(token);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load data. Please try again.");
    }
  };

  const fetchUserLikedAndSavedArticles = async (token) => {
    try {
      if (!token) {
        console.log('No token available for fetching user articles');
        return;
      }

      console.log('Fetching user articles...');

      const response = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/user/articles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.success) {
        const likedArticles = Array.isArray(response.data.liked_articles)
          ? response.data.liked_articles.map(id => id?.toString()).filter(Boolean)
          : [];
        const savedArticles = Array.isArray(response.data.saved_articles)
          ? response.data.saved_articles.map(id => id?.toString()).filter(Boolean)
          : [];

        dispatch({ type: 'GET_LIKE_LIST', payload: likedArticles });
        dispatch({ type: 'GET_SAVE_LIST', payload: savedArticles });
      } else {
        console.error("Invalid response format:", response.data);
      }
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
        console.error("Error fetching user articles:", error.message);
      }
    }
  };

  const filterArticles = async () => {
    const token = await getAuthToken(reduxToken);
    if (token) {
      dispatch(fetchData(1, true, inputTag));
    }
  };

  const handleTagPress = (tag) => {
    if (inputTag.includes(tag)) {
      setInputTag((prevTags) => prevTags.filter((t) => t !== tag));
    } else {
      setInputTag((prevTags) => [...prevTags, tag]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadInitialData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
          <Icon name="filter" size={30} color="black" />
        </TouchableOpacity>
        
        {articles && articles.length > 0 ? (
          <MasonryList
            numColumns={2}
            data={articles}
            keyExtractor={(item) => item["_id"]?.toString() || item["article_link"]}
            onEndReached={() => {
              if (!isLoading && currentPage < articleData.pagination.pages) {
                setCurrentPage(prev => prev + 1);
                dispatch(fetchData(currentPage + 1, true, inputTag));
              }
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              console.log('Rendering article:', {
                id: item["_id"],
                title: item["article_title"]
              });

              return (
                <Article
                  article={{
                    title: item["article_title"],
                    image: item["article_preview_image"],
                    author: item["author_name"],
                    likes: item["like_count"],
                    saves: item["save_count"],
                    article_id: item["_id"]?.toString() || '',
                    article_link: item["article_link"],
                    author_id: item["author_id"]?.toString() || '',
                  }}
                />
              );
            }}
          />
        ) : (
          <Text style={{ marginTop: 20 }}>No articles found</Text>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => {
          setShowFilterModal(!showFilterModal);
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{
            height: 350,
            width: 350,
            padding: 30,
            backgroundColor: "white",
            borderRadius: 10,
          }}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Icon name="times" size={20} color="black" />
            </TouchableOpacity>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <TextInput
                value={inputTag.join(", ")}
                placeholder="Search filters..."
                style={{
                  flex: 1,
                  borderColor: "gray",
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 5,
                }}
                editable={false}
              />
              <TouchableOpacity
                onPress={() => filterArticles()}
                style={{ marginLeft: 10 }}
              >
                <Icon name="search" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}>
              {tags && tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={[
                    styles.tagButton,
                    inputTag.includes(tag) && styles.tagButtonSelected,
                  ]}
                >
                  <Text style={
                    inputTag.includes(tag)
                      ? styles.tagTextSelected
                      : styles.tagText
                  }>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      {isProgress && <ActivityIndicator color={'#02833D'} size={'large'} style={{position:'absolute',left:0,right:0,top:0,bottom:0}} />}
    </View>
  );
};

const styles = StyleSheet.create({
  tagButton: {
    padding: 5,
    width: "48%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    marginRight: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  tagButtonSelected: {
    backgroundColor: "#C1E1C1",
  },
  tagText: {
    color: "black",
  },
  tagTextSelected: {
    color: "black",
  },
  closeModalButton: {
    position: "absolute",
    top: 2,
    left: 1,
    padding: 10,
  },
  apiQueryText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: 'monospace',
  },
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
});

export default NewsFeedScreen;