import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector } from "react-redux";
import { WebView } from 'react-native-webview';
import { useNavigation } from "@react-navigation/native";

const AuthorNameScreen = ({ route }) => {
  const userInfo = useSelector((store) => store.userInfo.userInfo);
  const [authorInfo, setAuthorInfo] = useState(null);
  const author_id = route.params["id"];
  const webViewRef = useRef(null);

  const navigation = useNavigation();

  const navigateToShopLink = (link) => {
    navigation.navigate("Shop Now Webview", { link });
  };

  useEffect(() => {
    const fetchAuthorInfo = async () => {
      try {
        const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/discover/` + author_id);

        if (response.status === 200) {
          setAuthorInfo(response.data);
        } else {
          Alert.alert('Error', 'Failed to fetch author information');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch author information');
      }
    };

    fetchAuthorInfo();
  }, [author_id, MY_IP_ADDRESS]);

  return (
    <View style={styles.container}>
      <Text style={styles.bio}>
        {/* Display other information from the fetched authorInfo */}
        {/* Modify this as per your actual data structure */}
        {`Brand Name: ${authorInfo?.brand_name}`}
        {'\n'}
        <TouchableOpacity
          onPress={() => navigateToShopLink(authorInfo.shop_now_link)}
        >
          <Text style={styles.link}>{'Shop Now Link'}</Text>
        </TouchableOpacity>
        {'\n'}
        {`Title: ${authorInfo?.title}`}
        {'\n'}
        {`Intro: ${authorInfo?.intro}`}
        {/* Add your bio content here */}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  link: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 120,
    color: 'blue',
  },
});

export default AuthorNameScreen;
