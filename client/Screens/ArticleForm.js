import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector } from "react-redux";

const ArticleForm = () => {
  const [articleTitle, setArticleTitle] = useState("");
  const [articleImage, setArticleImage] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [authorPfpLink, setAuthorPfpLink] = useState("");
  const [tags, setTags] = useState("");
  const userInfo = useSelector((store) => store.userInfo.userInfo);

  const handleSubmit = async () => {
     Keyboard.dismiss()
    if(articleTitle.trim().length == 0){
      Alert.alert("Error","Article Title cannot be empty")
    } else if(articleLink.trim().length == 0){
      Alert.alert("Error","Article Link cannot be empty")
    } else if(articleImage.trim().length == 0){
      Alert.alert("Error","Article Image Link cannot be empty")
    } else if(authorPfpLink.trim().length == 0){
      Alert.alert("Error","Author Profile Picture Link cannot be empty")
    } else if(tags.trim().length == 0){
      Alert.alert("Error","Tags cannot be empty")
    } else{

    try {
      const url = `http://${MY_IP_ADDRESS}:5050/posts/create`;
      const payload = {
        article_title: articleTitle,
        article_preview_image: articleImage,
        article_link: articleLink,
        author_id: userInfo["_id"],
        author_name: userInfo["first_name"] + " " + userInfo["last_name"],
        author_pfp_link: authorPfpLink,
        tags: tags.split(",").map((tag) => tag.trim()),
      };

      const response = await axios.post(url, payload);

      if (response.data.success) {
        Alert.alert("Article Created Successfully");
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error(error);
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
        <TouchableOpacity
          style={styles.updateButtonStyle}
          onPress={(view) => {
            handleSubmit();
          }}
        >
          <Text style={styles.updateButtonTextStyle}>Submit Article</Text>
        </TouchableOpacity>
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
