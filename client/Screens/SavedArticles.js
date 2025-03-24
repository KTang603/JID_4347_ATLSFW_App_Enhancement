import React, { useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
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

  useEffect(() => {
    dispatch(getSavedArticles(token, _id));
  }, []);

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
