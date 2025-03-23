import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity, Image, View, Text,StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const ListRowItem = ({ item,handleSave,handleLike}) => {
  const { like_count,tags, save_count,article_title,author_name, is_liked, is_saved,article_preview_image,article_link,_id } = item;
  const navigate = useNavigation();

  const navigateToContent = (link) => {
    navigate.navigate("Article Webview", { link });
  };


  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigateToContent(article_link)}
        activeOpacity={0.8}
      >
        {article_preview_image && (
          <Image
            source={{ uri: article_preview_image }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.articleContent}>
          <Text style={styles.cardTitle}>
            {article_title || "Untitled Article"}
          </Text>
          <View>
            <Text style={styles.cardSubtitle}>
              By {author_name || "Unknown Author"}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={(e) => {
                // e.stopPropagation();
                handleLike(_id);
              }}
              activeOpacity={0.6}
            >
              <Icon
                name={is_liked ? "heart" : "heart-o"}
                size={16}
                color={is_liked ? "#e74c3c" : "#666"}
              />
              <Text style={styles.statsText}>{like_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={(e) => {
                handleSave(_id);
              }}
              activeOpacity={0.6}
            >
              <Icon
                name={is_saved ? "bookmark" : "bookmark-o"}
                size={16}
                color={is_saved ? "#f39c12" : "#666"}
              />
              <Text style={styles.statsText}>{save_count}</Text>
            </TouchableOpacity>
          </View>
          {tags && tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  {tag}
                </Text>
              ))}
              {tags.length > 3 && (
                <Text style={styles.tag}>+{tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ListRowItem;
