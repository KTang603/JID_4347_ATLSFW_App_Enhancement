import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useSelector } from "react-redux";
import { createArticle } from "../redux/actions/NewsAction";
import AppPrimaryButton from "../components/AppPrimaryButton";

const ArticleForm = () => {
  const [articleTitle, setArticleTitle] = useState("");
  const [articleImage, setArticleImage] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [authorPfpLink, setAuthorPfpLink] = useState("");
  const [tags, setTags] = useState("");
  const userInfo = useSelector((store) => store.userInfo.userInfo);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (articleTitle.trim().length == 0) {
      Alert.alert("Error", "Article Title cannot be empty");
    } else if (articleLink.trim().length == 0) {
      Alert.alert("Error", "Article Link cannot be empty");
    } else if (articleImage.trim().length == 0) {
      Alert.alert("Error", "Article Image Link cannot be empty");
    } else if (authorPfpLink.trim().length == 0) {
      Alert.alert("Error", "Author Profile Picture Link cannot be empty");
    } else if (tags.trim().length == 0) {
      Alert.alert("Error", "Tags cannot be empty");
    } else {
      const response = await createArticle(
        articleTitle,
        articleImage,
        articleLink,
        userInfo,
        authorPfpLink,
        tags
      );
      if (response.data.success) {
        setArticleTitle("");
        setArticleImage("");
        setArticleLink("");
        setAuthorPfpLink("");
        setTags("");
        Alert.alert("Article Created Successfully");
      } else {
        Alert.alert("Error", response.data.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Article Title"
          onChangeText={setArticleTitle}
          value={articleTitle}
          // onFocus={() =>
          //   Alert.alert(
          //     "Please complete filling out your vendor information prior to creating an article!"
          //   )
          // }
        />
        <TextInput
          style={styles.input}
          placeholder="Article Link"
          onChangeText={setArticleLink}
          value={articleLink}
        />
        <TextInput
          style={styles.input}
          placeholder="Article Preview Image URL"
          onChangeText={setArticleImage}
          value={articleImage}
        />
        <TextInput
          style={styles.input}
          placeholder="Author Profile Picture Link"
          onChangeText={setAuthorPfpLink}
          value={authorPfpLink}
        />
        <TextInput
          style={styles.input}
          placeholder="Tags"
          onChangeText={setTags}
          value={tags}
        />

        <AppPrimaryButton title="Submit Article" handleSubmit={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  updateButtonStyle: {
    backgroundColor: "lightgray",
    borderRadius: 3,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 12,
  },
  updateButtonTextStyle: {
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
  input: {
    width: "100%",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
  },
});

export default ArticleForm;
