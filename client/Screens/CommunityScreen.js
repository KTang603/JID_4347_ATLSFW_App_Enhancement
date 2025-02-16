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
import SignupScreen from "./SignUpScreen";
import AuthorNameScreen from "./AuthorNameScreen"; // Import the AuthorNameScreen component
import Article from "../components/Article";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import ProfilePage from "./ProfilePage";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/actions/loginAction";


// Main component
const CommunityScreen = ({ navigation }) => {
  const [isSavePressed, setSavePressed] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false); // For filter modal visibility
  const [tags, setTags] = useState([]); // State for the tags
  const [inputTag, setInputTag] = useState([]); // For input field

  const liked_articles_state = useSelector(
    (store) => store.liked_articles.liked_articles
  );
  const saved_articles_state = useSelector(
    (store) => store.saved_articles.saved_articles
  );
  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const token = useSelector((store) => store.token?.token);
  const dispatch = useDispatch();

  // Add debug logging
  useEffect(() => {
    console.log('Current token:', token);
  }, [token]);

  const handleSavePress = () => {
    // Toggle the state when the Save button is pressed
    setSavePressed(!isSavePressed);
  };

  const [articleData, setArticleData] = useState({ articles: [], pagination: { page: 1, pages: 1 } });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // function for fetching article data with selected tags and pagination
  const fetchData = async (page = 1, loadMore = false) => {
    try {
      if (!token) {
        console.error('No token available for posts fetch');
        return;
      }

      setIsLoading(true);
      const response = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/posts?tags=${inputTag.join(",")}&page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

//       console.log(response.data)
//       setArticleData(response.data);
//       //console.log(response.data)


      // Debug logging
      console.log('Fetched articles:', response.data.articles.map(a => ({
        id: a._id,
        title: a.article_title
      })));

      // Ensure all article IDs are strings
      const articles = response.data.articles.map(article => ({
        ...article,
        _id: article._id?.toString() || '',
        author_id: article.author_id?.toString() || ''
      }));

      // Debug logging
      console.log('Setting article data:', {
        loadMore,
        currentArticles: loadMore ? articleData.articles.length : 0,
        newArticles: articles.length,
        pagination: response.data.pagination
      });

      if (loadMore) {
        // Ensure all IDs in both arrays are strings
        const currentArticles = articleData.articles.map(article => ({
          ...article,
          _id: article._id?.toString() || '',
          author_id: article.author_id?.toString() || ''
        }));

        setArticleData(prev => ({
          articles: [...currentArticles, ...articles],
          pagination: response.data.pagination
        }));
      } else {
        setArticleData({
          articles,
          pagination: response.data.pagination
        });
      }

      // Debug logging after update
      console.log('Article data updated:', {
        totalArticles: loadMore ? 
          articleData.articles.length + articles.length : 
          articles.length
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error during data fetch:", error.message);
    }
  };

  // Load initial data when token changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (token) {
        try {
          // First load user's liked and saved articles
          await fetchUserLikedAndSavedArticles();
          // Then load articles
          await fetchData();
        } catch (error) {
          console.error('Error loading initial data:', error);
          // If token is invalid, redirect to login
          if (error.response?.status === 401) {
            dispatch(logout());
            navigation.navigate('Log In');
          }
        }
      }
    };
    loadInitialData();
  }, [token]);

  // Reload data when liked/saved articles change
  useEffect(() => {
    if (token && (liked_articles_state || saved_articles_state)) {
      // Debug logging
      console.log('Reloading data due to state change:', {
        liked_articles_state,
        saved_articles_state
      });
      
      // Reset to first page when reloading
      setCurrentPage(1);
      fetchData(1, false);
    }
  }, [liked_articles_state, saved_articles_state]);

  // Debug logging for article data changes
  useEffect(() => {
    console.log('Article data updated:', {
      totalArticles: articleData.articles.length,
      currentPage,
      totalPages: articleData.pagination.pages
    });
  }, [articleData]);

  // Debug logging for saved articles state
  useEffect(() => {
    console.log('CommunityScreen: saved_articles_state changed:', saved_articles_state);
  }, [saved_articles_state]);

  const fetchUserLikedAndSavedArticles = async () => {
    try {
      if (!token) {
        console.log('No token available for fetching user articles');
        return;
      }

      // Debug logging
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
      
      // Debug logging
      console.log('User articles response:', response.data);
      
      if (response.data && response.data.success) {
        // Ensure arrays and convert IDs to strings
        const likedArticles = Array.isArray(response.data.liked_articles)
          ? response.data.liked_articles.map(id => id?.toString()).filter(Boolean)
          : [];
        const savedArticles = Array.isArray(response.data.saved_articles)
          ? response.data.saved_articles.map(id => id?.toString()).filter(Boolean)
          : [];

        // Debug logging
        console.log('Processed articles:', {
          liked: likedArticles,
          saved: savedArticles
        });

        dispatch({ type: 'GET_LIKE_LIST', payload: likedArticles });
        dispatch({ type: 'GET_SAVE_LIST', payload: savedArticles });
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        dispatch(logout());
        navigation.navigate('Log In');
      } else {
        console.error("Error fetching user articles:", error.message);
      }
    }
  };

  const filterArticles = async () => {
    // Fetch data when filtering is applied
    await fetchData();
  };

  useEffect(() => {
    // Fetch tags from the new endpoint
    const fetchTags = async () => {
      try {
        if (!token) {
          console.error('No token available');
          return;
        }
        const url = `http://${MY_IP_ADDRESS}:5050/tags`;
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data && Array.isArray(response.data)) {
          setTags(response.data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error.message);
      }
    };
    if (token) {
      fetchTags();
    }
  }, [token]); // Re-fetch when token changes

  const handleTagPress = (tag) => {
    if (inputTag.includes(tag)) {
      // Remove the tag if it's already selected
      setInputTag((prevTags) => prevTags.filter((t) => t !== tag));
    } else {
      // Add the tag if it's not selected
      setInputTag((prevTags) => [...prevTags, tag]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Filter Icon */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
          <Icon name="filter" size={30} color="black" />
        </TouchableOpacity>
        {articleData &&
        <MasonryList
          numColumns={2}
          data={articleData.articles}
          keyExtractor={(item) => item["_id"]}
          onEndReached={() => {
            if (!isLoading && currentPage < articleData.pagination.pages) {
              setCurrentPage(prev => prev + 1);
              fetchData(currentPage + 1, true);
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => {
            // Debug logging
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
        }
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => {
          setShowFilterModal(!showFilterModal);
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              height: 350,
              width: 350,
              padding: 30,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Icon name="times" size={20} color="black" />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
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
            {/* Container for filter buttons */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={[
                    styles.tagButton,
                    inputTag.includes(tag) && styles.tagButtonSelected,
                  ]}
                >
                  <Text
                    style={
                      inputTag.includes(tag)
                        ? styles.tagTextSelected
                        : styles.tagText
                    }
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// New StyleSheet for the tag buttons
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
    position: "absolute", // Absolute position
    top: 2,
    left: 1,
    padding: 10,
  },
});

export default CommunityScreen;
