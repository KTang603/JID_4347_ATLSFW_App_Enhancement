
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { like, unlike } from "../redux/actions/likeAction";
import { save, unsave } from "../redux/actions/saveAction";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthorNameScreen from "../Screens/AuthorNameScreen"; // Import the AuthorNameScreen component
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useNavigation } from "@react-navigation/native";

const Article = (props) => {
  const {
    image,
    title,
    author,
    likes,
    saves,
    article_id,
    article_link,
    author_id,
  } = props.article;
  const account_type = useSelector((store) => store.acct_type.acct_type);
  //account_type = 1; //hardcode here to test save count text

  const liked_articles_state = useSelector(
    (store) => store.liked_articles.liked_articles
  );
  const saved_articles_state = useSelector(
    (store) => store.saved_articles.saved_articles
  );

  const navigation = useNavigation();

  // const [ratio, setRatio] = useState(1);
  const [isSavePressed, setSavePressed] = useState(
    saved_articles_state.includes(article_id)
  ); //replace with .includes
  const [liked, setLiked] = useState(liked_articles_state.includes(article_id));

  const navigateToContent = (link) => {
    navigation.navigate("Article Webview", { link });
  };

  const navigateToAuthor = (id) => {
    navigation.navigate("Author", { id });
  };

  // useEffect(() => {
  //   if (image) {
  //     Image.getSize(image, (width, height) => setRatio(width / height));
  //   }
  // }, [image]);

  //begin like button functionality
  const dispatch = useDispatch();

  //redux states
  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const user_id = useSelector((store) => store.user_id.user_id);
  let liked_articles = [];

  //set liked articles to liked

  const handleLike = () => {
    // toggle button state
    setLiked((liked) => !liked);

    if (isLogged) {
      if (!liked) {
        // create temp list, append new liked article
        liked_articles = liked_articles_state.slice();
        liked_articles.push(article_id);
        liked_articles = [...new Set(liked_articles)];

        // hit BE endpoint
        addedToDB(liked_articles);
      } else {
        // create temp list, remove liked article
        liked_articles = liked_articles_state.slice();
        liked_articles.splice(liked_articles.indexOf(article_id), 1);

        // hit BE endpoint
        removeFromDB(liked_articles);
      }
    } else {
      navigation.reset({ index: 0, routes: [{ name: "Log In" }] });
    }
  };

  const addedToDB = async () => {
    const response = await axios.post(
      "http://" +
        MY_IP_ADDRESS +
        ":5050/" +
        "posts/" +
        user_id +
        "/" +
        article_id +
        "?like=1",
      {
        liked_articles,
      }
    );

    const data = response.data;

    if (data.success) {
      //dispatch like action if article has been added to db
      dispatch(like(article_id));
    }
  };

  const removeFromDB = async () => {
    const response = await axios.post(
      "http://" +
        MY_IP_ADDRESS +
        ":5050/" +
        "posts/" +
        user_id +
        "/" +
        article_id +
        "?like=-1",
      {
        liked_articles,
      }
    );

    const data = response.data;

    if (data.success) {
      //dispatch unlike action if article has been removed from db
      dispatch(unlike(article_id));
    }
  };

  // SAVE BUTTON
  let saved_articles = [];

  const handleSave = () => {
    // toggle button state
    setSavePressed((isSavePressed) => !isSavePressed);

    if (isLogged) {
      if (!isSavePressed) {
        // create temp list, append new saved article
        saved_articles = saved_articles_state.slice();
        saved_articles.push(article_id);
        saved_articles = [...new Set(saved_articles)];

        // hit BE endpoint
        saveToDB();
      } else {
        // create temp list, remove saved article
        saved_articles = saved_articles_state.slice();
        saved_articles.splice(saved_articles.indexOf(article_id), 1);

        // hit BE endpoint
        unsaveFromDB();
      }
    } else {
      navigation.replace("Log In");
    }
  };

  const saveToDB = async () => {
    const response = await axios.post(
      "http://" +
        MY_IP_ADDRESS +
        ":5050/" +
        "posts/" +
        user_id +
        "/" +
        article_id +
        "?save=1",
      {
        saved_articles,
      }
    );

    const data = response.data;

    if (data.success) {
      //dispatch save action if article has been added to db
      dispatch(save(article_id));
    }
  };

  const unsaveFromDB = async () => {
    const response = await axios.post(
      "http://" +
        MY_IP_ADDRESS +
        ":5050/" +
        "posts/" +
        user_id +
        "/" +
        article_id +
        "?save=-1",
      {
        saved_articles,
      }
    );

    const data = response.data;

    if (data.success) {
      //dispatch unsave action if article has been removed from db
      dispatch(unsave(article_id));
    }
  };

  return (
    <View style={styles.article}>
      <View>
        <TouchableOpacity onPress={() => navigateToContent(article_link)}>
          <Image
            source={{
              uri: image,
            }}
            style={styles.image}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={() => navigateToAuthor(author_id)}
          style={{ marginTop: 10 }}
        >
          <Text style={styles.authorName}>{author}</Text>
        </TouchableOpacity>
        <Pressable onPress={() => handleLike()} style={styles.likeButton}>
          <MaterialCommunityIcons
            name={liked ? "heart" : "heart-outline"}
            size={32}
            color={liked ? "red" : "black"}
          />
          <Text>{liked ? likes + 1 : likes}</Text>
        </Pressable>

        <TouchableOpacity
          onPress={() => handleSave()}
          style={[styles.saveButton, account_type == 1 && styles.saveText]}
        >
          <Icon
            name={isSavePressed ? "bookmark" : "bookmark-o"}
            size={30}
            color={isSavePressed ? "blue" : "black"}
          />
          {account_type === 1 && <Text>{saves}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  article: {
    width: "100%",
    padding:10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign:"left",
    margin: 10,
  },
  image: {
    width: Dimensions.get("window").width/2 - 20,
    height:110,
    borderRadius: 25,
  },
  likeButton: {
    // backgroundColor: "#D3CFD4",
    position: "absolute",
    bottom: 0,
    right: 10,
    padding: 5,
    borderRadius: 50,
  },
  saveButton: {
    position: "absolute",
    bottom: 20,
    right: 48,
    padding: 5,
    borderRadius: 50,
  },
  saveText: {
    bottom: 2,
  },
  authorName: {
    textDecorationLine: "underline",
    left: 10,
    marginBottom: 20,
  },
});

export default Article;
