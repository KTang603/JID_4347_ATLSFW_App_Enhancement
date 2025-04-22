import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { fetchData, handleLike, handleSave } from "../redux/actions/NewsAction";
import BaseIndicator from "../components/BaseIndicator";
import ListRowItem from "../components/ListRowItem";

const NewsFeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { articles, isProgress, pagination } = useSelector((state) => state.news);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id: userId } = useSelector((state) => state.userInfo?.userInfo || {});

  // State for sort order and search
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Set header right button with sort icon
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setSortAscending(!sortAscending)}
          style={{ marginRight: 10 }}
        >
          <Icon 
            name={sortAscending ? "sort-amount-asc" : "sort-amount-desc"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, sortAscending]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchArticles();
    }
  }, [token, sortAscending, fetchArticles]);

  // Memoized callbacks
  const fetchArticles = useCallback(() => {
    const sortOrder = sortAscending ? 'asc' : 'desc';
    dispatch(fetchData(1, [], token, navigation, sortOrder, searchQuery));
  }, [dispatch, token, navigation, sortAscending, searchQuery]);

  const loadNextPage = useCallback(() => {
    const { page, pages } = pagination;
    if (page < pages) {
      const sortOrder = sortAscending ? 'asc' : 'desc';
      dispatch(fetchData(page + 1, [], token, navigation, sortOrder, searchQuery));
    }
  }, [dispatch, pagination, token, navigation, sortAscending, searchQuery]);

  const handleLikeCallback = useCallback((articleId) => {
    dispatch(handleLike({ token, articles_id: articleId, user_id: userId }));
  }, [dispatch, token, userId]);

  const handleSaveCallback = useCallback((articleId) => {
    dispatch(handleSave({ token, articles_id: articleId, user_id: userId }));
  }, [dispatch, token, userId]);

  const navigateToContent = useCallback((link) => {
    navigation.navigate("Article Webview", { link });
  }, [navigation]);

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No articles found</Text>
    </View>
  );

  // Handle search button press
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    const sortOrder = sortAscending ? 'asc' : 'desc';
    dispatch(fetchData(1, [], token, navigation, sortOrder, text));
  }, [dispatch, token, navigation, sortAscending]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          onPress={() => handleSearch(searchQuery)}
          style={styles.searchButton}
        >
          <Icon name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={articles}
        refreshing={false}
        onRefresh={fetchArticles}
        renderItem={({ item }) => (
          <ListRowItem
            item={item}
            handleLike={handleLikeCallback}
            handleSave={handleSaveCallback}
            onPressItem={() => navigateToContent(item.article_link)}
          />
        )}
        keyExtractor={(item) => item._id?.toString() || item.article_link}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={EmptyState}
      />
      {isProgress && <BaseIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 10,
    paddingLeft: 15,
    paddingRight: 8,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#02833D',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    padding: 0,
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: '#02833D',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
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
});

export default NewsFeedScreen;
