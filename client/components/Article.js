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
import { logout } from "../redux/actions/loginAction";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthorNameScreen from "../Screens/AuthorNameScreen";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useNavigation } from "@react-navigation/native";

const Article = (props) => {
  const {
    image,
    title,
    author,
    likes: initialLikes,
    saves,
    article_id,
    article_link,
    author_id,
  } = props.article;

  // Debug logging
  console.log('Article props:', {
    article_id,
    initialLikes,
    saves
  });

  const likes = Math.max(0, initialLikes || 0);
  const account_type = useSelector((store) => store.acct_type.acct_type);
  const liked_articles_state = useSelector((store) => {
    // Debug logging
    console.log('Liked articles state:', store.liked_articles);
    return store.liked_articles.liked_articles;
  });
  const saved_articles_state = useSelector((store) => {
    // Debug logging
    console.log('Saved articles state:', store.saved_articles);
    return store.saved_articles.saved_articles;
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isSavePressed, setSavePressed] = useState(false);
  const [saveCount, setSaveCount] = useState(Math.max(0, saves || 0));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.max(0, likes || 0));
  
  // Handle saved state
  useEffect(() => {
    // Convert all IDs to strings for comparison
    const articleIdStr = article_id.toString();
    const savedArticlesStr = saved_articles_state.map(id => id.toString());
    const isArticleSaved = savedArticlesStr.includes(articleIdStr);
    
    // Debug logging
    console.log('Checking saved state:', {
      articleIdStr,
      savedArticlesStr,
      isArticleSaved
    });
    
    setSavePressed(isArticleSaved);
  }, [saved_articles_state, article_id]);

  // Handle liked state
  useEffect(() => {
    // Convert all IDs to strings for comparison
    const articleIdStr = article_id.toString();
    const likedArticlesStr = liked_articles_state.map(id => id.toString());
    const isArticleLiked = likedArticlesStr.includes(articleIdStr);
    
    // Debug logging
    console.log('Checking liked state:', {
      articleIdStr,
      likedArticlesStr,
      isArticleLiked
    });
    
    setLiked(isArticleLiked);
  }, [liked_articles_state, article_id]);
  const [isLoading, setIsLoading] = useState(false);

  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const user_id = useSelector((store) => store.user_id.user_id);
  const token = useSelector((store) => store.token.token);

  const navigateToContent = (link) => {
    navigation.navigate("Article Webview", { link });
  };

  const navigateToAuthor = (id) => {
    navigation.navigate("Author", { id });
  };

  const handleLike = async () => {
    if (isLoading) return;

    if (!isLogged || !token) {
      dispatch(logout());
      navigation.navigate('Log In');
      return;
    }
    setIsLoading(true);

    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => {
      const newCount = newLikedState ? prev + 1 : prev - 1;
      return Math.max(0, newCount);
    });

    try {
      // Debug logging
      console.log('Current state:', {
        liked_articles_state,
        article_id,
        newLikedState
      });

      // Ensure we're working with strings and valid arrays
      const currentLikedArticles = Array.isArray(liked_articles_state) 
        ? liked_articles_state.map(id => id?.toString()).filter(Boolean)
        : [];

      let newLikedArticles;
      if (newLikedState) {
        // Add article to liked list
        const newArticleId = article_id.toString();
        newLikedArticles = [...new Set([...currentLikedArticles, newArticleId])];
        
        console.log('Adding like:', {
          currentLikedArticles,
          newArticleId,
          newLikedArticles
        });
        
        await addedToDB(newLikedArticles);
      } else {
        // Remove article from liked list
        const targetId = article_id.toString();
        newLikedArticles = currentLikedArticles.filter(id => id !== targetId);
        
        console.log('Removing like:', {
          currentLikedArticles,
          targetId,
          newLikedArticles
        });
        
        await removeFromDB(newLikedArticles);
      }
    } catch (error) {
      // Revert UI state on error
      setLiked(!newLikedState);
      setLikeCount(prev => {
        const newCount = !newLikedState ? prev + 1 : prev - 1;
        return Math.max(0, newCount);
      });
      console.error('Like action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addedToDB = async (liked_articles) => {
    try {
      // Debug logging
      console.log('Adding like:', {
        article_id,
        liked_articles,
      });

      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${article_id.toString()}/?like=1`,
        { liked_articles },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Debug logging
        console.log('Like successful:', {
          article_id,
          liked_articles,
          response: response.data
        });
        dispatch(like(article_id.toString()));
      } else {
        throw new Error(response.data.message || 'Like action failed');
      }
    } catch (error) {
      console.error('Like failed:', {
        error,
        response: error.response?.data,
        article_id,
        liked_articles
      });
      throw error;
    }
  };

  const removeFromDB = async (liked_articles) => {
    try {
      // Debug logging
      console.log('Removing like:', {
        article_id,
        liked_articles,
      });

      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${article_id.toString()}/?like=-1`,
        { liked_articles },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Debug logging
        console.log('Unlike successful:', {
          article_id,
          liked_articles,
          response: response.data
        });
        dispatch(unlike(article_id.toString()));
      } else {
        throw new Error(response.data.message || 'Unlike action failed');
      }
    } catch (error) {
      console.error('Unlike failed:', {
        error,
        response: error.response?.data,
        article_id,
        liked_articles
      });
      throw error;
    }
  };

  const handleSave = async () => {
    if (isLoading) return;

    if (!isLogged || !token) {
      dispatch(logout());
      navigation.navigate('Log In');
      return;
    }
    setIsLoading(true);

    const newSaveState = !isSavePressed;
    let saved_articles = [];

    // Update UI immediately
    setSavePressed(newSaveState);
    setSaveCount(prev => {
      const newCount = newSaveState ? prev + 1 : prev - 1;
      return Math.max(0, newCount);
    });

    try {
      if (newSaveState) {
        // Ensure we're working with strings
        const currentSavedArticles = saved_articles_state.map(id => id.toString());
        saved_articles = [...new Set([...currentSavedArticles, article_id.toString()])];
        await saveToDB(saved_articles);
      } else {
        // Ensure we're working with strings
        const currentSavedArticles = saved_articles_state.map(id => id.toString());
        saved_articles = currentSavedArticles.filter(id => id !== article_id.toString());
        await unsaveFromDB(saved_articles);
      }
    } catch (error) {
      // Revert UI state on error
      setSavePressed(!newSaveState);
      setSaveCount(prev => {
        const newCount = !newSaveState ? prev + 1 : prev - 1;
        return Math.max(0, newCount);
      });
      console.error('Save action failed:', {
        error,
        response: error.response?.data,
        article_id,
        saved_articles_state
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDB = async (saved_articles) => {
    try {
      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${article_id.toString()}/?save=1`,
        { saved_articles },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Debug logging
        console.log('Save successful:', {
          article_id,
          saved_articles,
          response: response.data
        });
        dispatch(save(article_id.toString()));
      } else {
        throw new Error(response.data.message || 'Save action failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const unsaveFromDB = async (saved_articles) => {
    try {
      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/posts/${article_id.toString()}/?save=-1`,
        { saved_articles },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Debug logging
        console.log('Unsave successful:', {
          article_id,
          saved_articles,
          response: response.data
        });
        dispatch(unsave(article_id.toString()));
      } else {
        throw new Error(response.data.message || 'Unsave action failed');
      }
    } catch (error) {
      throw error;
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
        <Pressable 
          onPress={handleLike} 
          style={[styles.likeButton, isLoading && styles.disabled]}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name={liked ? "heart" : "heart-outline"}
            size={32}
            color={liked ? "red" : "black"}
          />
          <Text>{likeCount}</Text>
        </Pressable>

        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveButton, 
            account_type == 1 && styles.saveText,
            isLoading && styles.disabled
          ]}
          disabled={isLoading}
        >
          <Icon
            name={isSavePressed ? "bookmark" : "bookmark-o"}
            size={30}
            color={isSavePressed ? "blue" : "black"}
          />
          {account_type === 1 && <Text>{saveCount}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  article: {
    width: "100%",
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    margin: 10,
  },
  image: {
    width: Dimensions.get("window").width/2 - 20,
    height: 110,
    borderRadius: 25,
  },
  likeButton: {
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
  disabled: {
    opacity: 0.5,
  },
});

export default Article;
