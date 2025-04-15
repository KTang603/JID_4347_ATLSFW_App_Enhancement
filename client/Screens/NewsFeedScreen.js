import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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

  // State for sort order
  const [sortAscending, setSortAscending] = useState(false);

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

  // Initial data fetch and refetch when sort order changes
  useEffect(() => {
    if (token) {
      fetchArticles();
    }
  }, [token, sortAscending, fetchArticles]);

  // Memoized callbacks
  const fetchArticles = useCallback(() => {
    const sortOrder = sortAscending ? 'asc' : 'desc';
    dispatch(fetchData(1, [], token, navigation, sortOrder));
  }, [dispatch, token, navigation, sortAscending]);

  const loadNextPage = useCallback(() => {
    const { page, pages } = pagination;
    if (page < pages) {
      const sortOrder = sortAscending ? 'asc' : 'desc';
      dispatch(fetchData(page + 1, [], token, navigation, sortOrder));
    }
  }, [dispatch, pagination, token, navigation, sortAscending]);

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

  return (
    <View style={styles.container}>
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
