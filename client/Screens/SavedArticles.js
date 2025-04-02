import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import ListRowItem from "../components/ListRowItem";
import { getSavedArticles } from "../redux/actions/saveAction";
import { handleLike, handleSave } from "../redux/actions/NewsAction";
import BaseIndicator from "../components/BaseIndicator";

const SavedArticles = ({ navigation }) => {
  const token = useSelector((store) => store.userInfo?.token);
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const { _id } = userInfo;
  const dispatch = useDispatch();
  const { articles, progress } = useSelector(
    (store) => store.saved_articles
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getSavedArticles(token, _id, navigation));
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getSavedArticles(token, _id, navigation));
    setRefreshing(false);
  };

  const _likeCallback = (id) => {
    dispatch(handleLike({ token, articles_id: id, user_id: _id }));
  };

  const _saveCallback = (id) => {
    dispatch(handleSave({ token, articles_id: id, user_id: _id }));
  };

  return (
    <View style={{ flex: 1 }}>
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
        // ListEmptyComponent={renderEmptyState}
      />
      {progress && <BaseIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
});

export default SavedArticles;
