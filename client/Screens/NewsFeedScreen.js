import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import Icon from "react-native-vector-icons/FontAwesome";
import Article from "../components/Article";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../redux/actions/NewsAction";

const NewsFeedScreen = ({ navigation }) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const newsData = useSelector(state => state.news)
  const {articles,isProgress,tags} = newsData
  const [inputTag, setInputTag] = useState([]);
  const dispatch = useDispatch();

  const [articleData, setArticleData] = useState({ articles: [], pagination: { page: 1, pages: 1 } });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // const liked_articles_state = useSelector(
  //   (store) => store.liked_articles.liked_articles
  // );
  // const saved_articles_state = useSelector(
  //   (store) => store.saved_articles.saved_articles
  // );


  // const fetchData = async (page = 1, loadMore = false) => {
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.get(
  //       `http://${MY_IP_ADDRESS}:5050/posts?tags=${inputTag.join(",")}&page=${page}&limit=20`,
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
  //     console.log('Fetched articles:', response.data.articles.map(a => ({
  //       id: a._id,
  //       title: a.article_title
  //     })));

  //     const articles = response.data.articles.map(article => ({
  //       ...article,
  //       _id: article._id?.toString() || '',
  //       author_id: article.author_id?.toString() || ''
  //     }));

  //     console.log('Setting article data:', {
  //       loadMore,
  //       currentArticles: loadMore ? articleData.articles.length : 0,
  //       newArticles: articles.length,
  //       pagination: response.data.pagination
  //     });

  //     if (loadMore) {
  //       const currentArticles = articleData.articles.map(article => ({
  //         ...article,
  //         _id: article._id?.toString() || '',
  //         author_id: article.author_id?.toString() || ''
  //       }));

  //       setArticleData(prev => ({
  //         articles: [...currentArticles, ...articles],
  //         pagination: response.data.pagination
  //       }));
  //     } else {
  //       setArticleData({
  //         articles,
  //         pagination: response.data.pagination
  //       });
  //     }

  //     console.log('Article data updated:', {
  //       totalArticles: loadMore ? 
  //         articleData.articles.length + articles.length : 
  //         articles.length
  //     });
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Error during data fetch:", error.message);
  //   }
  // };

  useEffect(() => {
     dispatch(fetchData(1,true,inputTag));
     fetchUserLikedAndSavedArticles();
  }, []);

  // useEffect(() => {
  //   if (token && (liked_articles_state || saved_articles_state)) {
  //     console.log('Reloading data due to state change:', {
  //       liked_articles_state,
  //       saved_articles_state
  //     });
      
  //     setCurrentPage(1);
  //     fetchData(1, false);
  //   }
  // }, [liked_articles_state, saved_articles_state]);

  // useEffect(() => {
  //   console.log('Article data updated:', {
  //     totalArticles: articleData.articles.length,
  //     currentPage,
  //     totalPages: articleData.pagination.pages
  //   });
  // }, [articleData]);



  const fetchUserLikedAndSavedArticles = async () => {
    try {
      if (!token) {
        console.log('No token available for fetching user articles');
        return;
      }
      console.log('token---'+token);
      console.log('http://${MY_IP_ADDRESS}:5050/user/articles=----'+`http://${MY_IP_ADDRESS}:5050/user/articles`);

      console.log('Fetching user articles...');

      const response = await axios.get(
        `http://${MY_IP_ADDRESS}:5050/user/articles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('User articles response:', response.data);
      
      if (response.data && response.data.success) {
        const likedArticles = Array.isArray(response.data.liked_articles)
          ? response.data.liked_articles.map(id => id?.toString()).filter(Boolean)
          : [];
        const savedArticles = Array.isArray(response.data.saved_articles)
          ? response.data.saved_articles.map(id => id?.toString()).filter(Boolean)
          : [];

        console.log('Processed articles:', {
          liked: likedArticles,
          saved: savedArticles
        });

        dispatch({ type: 'GET_LIKE_LIST', payload: likedArticles });
        dispatch({ type: 'GET_SAVE_LIST', payload: savedArticles });
      } else {
        console.error("Invalid response format:", response.data);
      }
     
    
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        // dispatch(logout());
        navigation.navigate('Log In');
      } else {
        console.error("Error fetching user articles:", error.message);
      }
    }
  };

  const filterArticles = async () => {
    dispatch(fetchData(1,true,inputTag));
  };
  

  const handleTagPress = (tag) => {
    if (inputTag.includes(tag)) {
      setInputTag((prevTags) => prevTags.filter((t) => t !== tag));
    } else {
      setInputTag((prevTags) => [...prevTags, tag]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
          <Icon name="filter" size={30} color="black" />
        </TouchableOpacity>
        {articleData &&
        <MasonryList
          numColumns={2}
          data={articles}
          keyExtractor={(item) => item["_id"]?.toString() || item["article_link"]}
          onEndReached={() => {
            if (!isLoading && currentPage < articleData.pagination.pages) {
              setCurrentPage(prev => prev + 1);
              fetchData(currentPage + 1, true);
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            console.log('Rendering article:', {
              id: item["_id"],
              title: item["article_title"]
            });

            return (
              <Article
                article={{
                  title: item["article_title"],
                  image: item["article_preview_image"],
                  author: item["author_name"],
                  likes: item["like_count"],
                  saves: item["save_count"],
                  article_id: item["_id"]?.toString() || '',
                  article_link: item["article_link"],
                  author_id: item["author_id"]?.toString() || '',
                }}
              />
            );
          }}
        />
        }
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => {
          setShowFilterModal(!showFilterModal);
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{
            height: 350,
            width: 350,
            padding: 30,
            backgroundColor: "white",
            borderRadius: 10,
          }}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Icon name="times" size={20} color="black" />
            </TouchableOpacity>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <TextInput
                value={inputTag.join(", ")}
                placeholder="Search filters..."
                style={{
                  flex: 1,
                  borderColor: "gray",
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 5,
                }}
                editable={false}
              />
              <TouchableOpacity
                onPress={() => filterArticles()}
                style={{ marginLeft: 10 }}
              >
                <Icon name="search" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={[
                    styles.tagButton,
                    inputTag.includes(tag) && styles.tagButtonSelected,
                  ]}
                >
                  <Text style={
                    inputTag.includes(tag)
                      ? styles.tagTextSelected
                      : styles.tagText
                  }>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      {isProgress && <ActivityIndicator color={'#02833D'} size={'large'} style={{position:'absolute',left:0,right:0,top:0,bottom:0}} />}
    </View>
  );
};

const styles = StyleSheet.create({
  tagButton: {
    padding: 5,
    width: "48%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    marginRight: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  tagButtonSelected: {
    backgroundColor: "#C1E1C1",
  },
  tagText: {
    color: "black",
  },
  tagTextSelected: {
    color: "black",
  },
  closeModalButton: {
    position: "absolute",
    top: 2,
    left: 1,
    padding: 10,
  },
  apiQueryText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: 'monospace',
  },
});

export default NewsFeedScreen;
