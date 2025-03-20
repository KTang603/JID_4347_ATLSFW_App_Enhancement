import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../redux/actions/NewsAction";
import BaseIndicator from "../components/BaseIndicator";

const NewsFeedScreen = ({ navigation }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const newsData = useSelector(state => state.news);
  const { articles, isProgress, tags } = newsData;
  const [inputTag, setInputTag] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((store) => store.token?.token);
  const liked_articles = useSelector((store) => store.liked_articles?.liked_articles || []);
  const saved_articles = useSelector((store) => store.saved_articles?.saved_articles || []);

  const [articleData, setArticleData] = useState({ articles: [], pagination: { page: 1, pages: 1 } });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Set the header right button when component mounts
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ marginRight: 10 }}
        >
          <Icon name="filter" size={24} color="white" />
          {inputTag.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{inputTag.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, inputTag]);

  // const fetchUserLikedAndSavedArticles = async () => {
  //   try {
  //     if (!token) {
  //       console.log('No token available for fetching user articles');
  //       return;
  //     }

  //     console.log('Fetching user articles...');

  //     const response = await axios.get(
  //       `http://${MY_IP_ADDRESS}:5050/user/articles`,
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
      
  //     if (response.data && response.data.success) {
  //       const likedArticles = Array.isArray(response.data.liked_articles)
  //         ? response.data.liked_articles.map(id => id?.toString()).filter(Boolean)
  //         : [];
  //       const savedArticles = Array.isArray(response.data.saved_articles)
  //         ? response.data.saved_articles.map(id => id?.toString()).filter(Boolean)
  //         : [];

  //       dispatch({ type: 'GET_LIKE_LIST', payload: likedArticles });
  //       dispatch({ type: 'GET_SAVE_LIST', payload: savedArticles });
  //     } else {
  //       console.error("Invalid response format:", response.data);
  //     }
  //   } catch (error) {
  //     if (error.response?.status === 401) {
  //       console.log('Token expired or invalid, redirecting to login');
  //       navigation.navigate('Log In');
  //     } else {
  //       console.error("Error fetching user articles:", error.message);
  //     }
  //   }
  // };

  const filterArticles = async () => {
    dispatch(fetchData(1, true, inputTag));
    setShowFilterModal(false);
  };

  const handleTagPress = (tag) => {
    if (inputTag.includes(tag)) {
      setInputTag((prevTags) => prevTags.filter((t) => t !== tag));
    } else {
      setInputTag((prevTags) => [...prevTags, tag]);
    }
  };

  const navigateToContent = (link) => {
    navigation.navigate("Article Webview", { link });
  };

  const navigateToAuthor = (id) => {
    navigation.navigate("Author", { id });
  };

  const handleLike = async (article) => {
    if (!token) {
      navigation.navigate('Log In');
      return;
    }

    const articleId = article._id?.toString();
    // Ensure we're working with strings
    const currentLikedArticles = Array.isArray(liked_articles) 
      ? liked_articles.map(id => id?.toString()).filter(Boolean)
      : [];
    
    const isCurrentlyLiked = currentLikedArticles.includes(articleId);
    const newLikedArticles = isCurrentlyLiked
      ? currentLikedArticles.filter(id => id !== articleId)
      : [...currentLikedArticles, articleId];

    try {
      // Check if current like_count is NaN and set it to 0
      if (isNaN(parseInt(article.like_count))) {
        article.like_count = 0;
      }

      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${articleId}/?like=${isCurrentlyLiked ? -1 : 1}`,
        { liked_articles: newLikedArticles },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        dispatch({ type: 'GET_LIKE_LIST', payload: newLikedArticles });
        // Refresh the articles to get updated counts
        dispatch(fetchData(currentPage, false, inputTag));
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleSave = async (article) => {
    if (!token) {
      navigation.navigate('Log In');
      return;
    }

    const articleId = article._id?.toString();
    // Ensure we're working with strings
    const currentSavedArticles = Array.isArray(saved_articles) 
      ? saved_articles.map(id => id?.toString()).filter(Boolean)
      : [];
    
    const isCurrentlySaved = currentSavedArticles.includes(articleId);
    const newSavedArticles = isCurrentlySaved
      ? currentSavedArticles.filter(id => id !== articleId)
      : [...currentSavedArticles, articleId];

    try {
      // Check if current save_count is NaN and set it to 0
      if (isNaN(parseInt(article.save_count))) {
        article.save_count = 0;
      }

      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${articleId}/?save=${isCurrentlySaved ? -1 : 1}`,
        { saved_articles: newSavedArticles },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        dispatch({ type: 'GET_SAVE_LIST', payload: newSavedArticles });
        // Refresh the articles to get updated counts
        dispatch(fetchData(currentPage, false, inputTag));
      }
    } catch (error) {
      console.error('Error updating save status:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const renderArticleItem = ({ item }) => {
    // Ensure we're working with strings for comparison
    const itemId = item._id?.toString();
    const isLiked = Array.isArray(liked_articles) 
      ? liked_articles.map(id => id?.toString()).includes(itemId)
      : false;
    const isSaved = Array.isArray(saved_articles)
      ? saved_articles.map(id => id?.toString()).includes(itemId)
      : false;

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          onPress={() => navigateToContent(item.article_link)}
          activeOpacity={0.8}
        >
          {item.article_preview_image && (
            <Image 
              source={{ uri: item.article_preview_image }} 
              style={styles.articleImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.articleContent}>
            <Text style={styles.cardTitle}>{item.article_title || "Untitled Article"}</Text>
            <TouchableOpacity onPress={() => navigateToAuthor(item.author_id)}>
              <Text style={styles.cardSubtitle}>By {item.author_name || "Unknown Author"}</Text>
            </TouchableOpacity>
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={(e) => {
                  e.stopPropagation();
                  handleLike(item);
                }}
                activeOpacity={0.6}
              >
                <Icon 
                  name={isLiked ? "heart" : "heart-o"} 
                  size={16} 
                  color={isLiked ? "#e74c3c" : "#666"} 
                />
                <Text style={styles.statsText}>
                  {isNaN(parseInt(item.like_count)) ? 0 : (item.like_count || 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={(e) => {
                  e.stopPropagation();
                  handleSave(item);
                }}
                activeOpacity={0.6}
              >
                <Icon 
                  name={isSaved ? "bookmark" : "bookmark-o"} 
                  size={16} 
                  color={isSaved ? "#f39c12" : "#666"} 
                />
                <Text style={styles.statsText}>
                  {isNaN(parseInt(item.save_count)) ? 0 : (item.save_count || 0)}
                </Text>
              </TouchableOpacity>
            </View>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
                {item.tags.length > 3 && (
                  <Text style={styles.tag}>+{item.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state when no articles are found
  const renderEmptyState = () => {
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No articles found</Text>
        {inputTag.length > 0 && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => {
              setInputTag([]);
              dispatch(fetchData(1, true, []));
            }}
          >
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const onRefresh =() => {
    dispatch(fetchData(1, true, [],token));
}

  return (
    <View style={styles.container}>
        <FlatList
          data={articles}
          refreshing={false}
          onRefresh={onRefresh}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item._id?.toString() || item.article_link}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (!isLoading && currentPage < articleData.pagination.pages) {
              setCurrentPage(prev => prev + 1);
              dispatch(fetchData(currentPage + 1, false, inputTag));
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
        />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Icon name="times" size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Articles</Text>
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsLabel}>
                {inputTag.length > 0 ? "Selected tags:" : "No tags selected"}
              </Text>
              <Text style={styles.selectedTags}>
                {inputTag.join(", ")}
              </Text>
            </View>
            <View style={styles.tagsGrid}>
              {tags.map((tag) => {
                 const isExist = inputTag.includes(tag);
                 return <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={[
                    styles.tagButton,
                    isExist && styles.tagButtonSelected,
                  ]}
                >
                  <Text style={
                     isExist
                      ? styles.tagTextSelected
                      : styles.tagText
                  }>
                    {tag}
                  </Text>
                </TouchableOpacity>
                  }
              )}
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                filterArticles();
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {isProgress && <BaseIndicator/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  filterBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#02833D",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    overflow: "hidden",
  },
  articleImage: {
    width: "100%",
    height: 180,
  },
  articleContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#e0f2f1",
    color: "#00796b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 5,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: "#02833D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  clearFiltersText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  selectedTagsContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  selectedTagsLabel: {
    fontWeight: "500",
    marginBottom: 5,
  },
  selectedTags: {
    color: "#02833D",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tagButton: {
    padding: 8,
    width: "48%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 8,
    alignItems: "center",
  },
  tagButtonSelected: {
    backgroundColor: "#e0f2f1",
    borderColor: "#02833D",
  },
  tagText: {
    color: "#333",
  },
  tagTextSelected: {
    color: "#02833D",
    fontWeight: "500",
  },
  closeModalButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  applyButton: {
    backgroundColor: "#02833D",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewsFeedScreen;
