import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text
} from "react-native";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import ListRowItem from "../components/ListRowItem";
import { getSavedArticles } from "../redux/actions/saveAction";
import { handleLike, handleSave } from "../redux/actions/NewsAction";
import BaseIndicator from "../components/BaseIndicator";

const SavedArticles = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Combine selectors to reduce rerenders
  const { 
    userInfo: { token, userInfo },
    saved_articles: { articles, progress, error }
  } = useSelector((store) => ({
    userInfo: store.userInfo || {},
    saved_articles: store.saved_articles || {}
  }),
  shallowEqual
);
  
  const { _id } = userInfo || {};
  const [refreshing, setRefreshing] = useState(false);

  // Fetch articles when component mounts or when dependencies change
  useEffect(() => {
    if (token && _id) {
      dispatch(getSavedArticles(token, _id, navigation));
    }
  }, [dispatch, token, _id, navigation]);

  // Memoize callbacks to prevent unnecessary rerenders
  const onRefresh = useCallback(async () => {
    if (!token || !_id) return;
    
    setRefreshing(true);
    try {
      await dispatch(getSavedArticles(token, _id, navigation));
    } catch (error) {
      console.error("Failed to refresh articles:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, token, _id, navigation]);

  const _likeCallback = useCallback((id) => {
    dispatch(handleLike({ token, articles_id: id, user_id: _id }));
  }, [dispatch, token, _id]);

  const _saveCallback = useCallback((id) => {
    dispatch(handleSave({ token, articles_id: id, user_id: _id }));
  }, [dispatch, token, _id]);

  // Empty state component
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No saved articles found. Articles you save will appear here.
      </Text>
    </View>
  ), []);

  if (!token || !_id) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please log in to view saved articles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <ListRowItem
            item={item}
            handleLike={_likeCallback}
            handleSave={_saveCallback}
          />
        )}
        keyExtractor={(item) => item._id?.toString() || item.article_link}
        contentContainerStyle={styles.listContainer}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9Bd35A", "#689F38"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {progress && <BaseIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffecec',
  },
  errorText: {
    color: '#d8000c',
    textAlign: 'center',
  }
});

export default SavedArticles;