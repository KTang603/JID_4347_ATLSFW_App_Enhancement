import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { fetchData, handleLike, handleSave } from "../redux/actions/NewsAction";
import BaseIndicator from "../components/BaseIndicator";
import ListRowItem from "../components/ListRowItem";

const NewsFeedScreen = ({ navigation }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const dispatch = useDispatch();
  const { articles, isProgress, tags, pagination } = useSelector((state) => state.news);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id: userId } = useSelector((state) => state.userInfo?.userInfo || {});

  // Set header right button with filter icon
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ marginRight: 10 }}
        >
          <Icon name="filter" size={24} color="white" />
          {selectedTags.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedTags.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTags]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchArticles();
    }
  }, [token]);

  // Memoized callbacks
  const fetchArticles = useCallback(() => {
    dispatch(fetchData(1, selectedTags, token, navigation));
  }, [dispatch, selectedTags, token, navigation]);

  const loadNextPage = useCallback(() => {
    const { page, pages } = pagination;
    if (page < pages) {
      dispatch(fetchData(page + 1, selectedTags, token, navigation));
    }
  }, [dispatch, pagination, selectedTags, token, navigation]);

  const handleLikeCallback = useCallback((articleId) => {
    dispatch(handleLike({ token, articles_id: articleId, user_id: userId }));
  }, [dispatch, token, userId]);

  const handleSaveCallback = useCallback((articleId) => {
    dispatch(handleSave({ token, articles_id: articleId, user_id: userId }));
  }, [dispatch, token, userId]);

  const handleTagPress = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  }, []);

  const applyFilters = useCallback(() => {
    fetchArticles();
    setShowFilterModal(false);
  }, [fetchArticles]);

  const clearFilters = useCallback(() => {
    setSelectedTags([]);
    dispatch(fetchData(1, [], token, navigation));
  }, [dispatch, token, navigation]);

  const navigateToContent = useCallback((link) => {
    navigation.navigate("Article Webview", { link });
  }, [navigation]);

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No articles found</Text>
      {selectedTags.length > 0 && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear filters</Text>
        </TouchableOpacity>
      )}
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
      
      {/* Filter Modal */}
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
                {selectedTags.length > 0 ? "Selected tags:" : "No tags selected"}
              </Text>
              <Text style={styles.selectedTags}>{selectedTags.join(", ")}</Text>
            </View>
            
            <View style={styles.tagsGrid}>
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => handleTagPress(tag)}
                    style={[
                      styles.tagButton,
                      isSelected && styles.tagButtonSelected,
                    ]}
                  >
                    <Text
                      style={isSelected ? styles.tagTextSelected : styles.tagText}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isProgress && <BaseIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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