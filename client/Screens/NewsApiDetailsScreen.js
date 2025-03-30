import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { useNavigation } from "@react-navigation/native";

const makeRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: 'http://' + MY_IP_ADDRESS + ':5050' + url,
    headers: {
      'Content-Type': 'application/json'
    },
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    }
  };

  if (data) {
    if (method.toLowerCase() === 'get') {
      config.params = data;
    } else {
      config.data = data;
    }
  }
 
  try {
    const response = await axios(config);
    console.log('Response:', response.data);
    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

const NewsApiDetailsScreen = () => {
  const [newsApiKey, setNewsApiKey] = useState('');
  const navigate = useNavigation();

  useEffect(() => {
    navigate.setOptions({
      title: 'News Api Config',
    })

    const fetchNewsApiKey = async () => {
      try {
        const response = await makeRequest('get', '/admin/fetch_news_api_key');
        if (response.data.status == 'success') {
          setNewsApiKey(response.data.data.api_key);
        }
      } catch (error) {
        console.error("Error fetching domains:", error.message);
      }
    };

    fetchNewsApiKey();
  }, []);


  const fetchNewsApiArticles = async () => {
    try {
      if (!newsApiKey) {
        Alert.alert('Error', 'Please enter your NewsData.io API key');
        return;
      }
      const response = await makeRequest('get', '/news/fetch');
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch articles');
    }
  };

  const saveNewsApiKey = async () => {
    try {
      if (!newsApiKey) {
        Alert.alert('Error', 'Please enter your NewsData.io API key');
        return;
      }
      const response = await makeRequest('post', '/admin/save_api_key', { 
        apiKey: newsApiKey
      });
      if (response.data.status == 'success') {
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch articles');
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>NewsData.io API KEY</Text>
        <TextInput
          placeholder="Ex: pub_69919892f87f86c7d48e31dfb61e8e91e0f3b"
          style={[styles.input, { marginBottom: 5 }]}
          value={newsApiKey}
          onChangeText={setNewsApiKey}
          secureTextEntry={false}
        />
        {/* <TextInput
          placeholder="Enter search query (e.g., fashion)"
          style={[styles.input, { marginBottom: 5 }]}
          value={newDomain}
          onChangeText={setNewDomain}
        /> */}
        {/* <Text style={styles.apiQueryText}>
          {`https://newsdata.io/api/1/latest?apikey=${newsApiKey || '[API_KEY]'}&q=${newDomain || '[QUERY]'}&language=en`}
        </Text> */}

        <AppPrimaryButton 
          title="Save"
          handleSubmit={saveNewsApiKey}
        />
        {__DEV__ && <>
        <Text style={[styles.sectionTitle,{marginBottom:0,marginTop:10}]}>NewsData.io Data</Text>
        <AppPrimaryButton 
          title="Fetch News Data"
          handleSubmit={fetchNewsApiArticles}
        />
        </>
         }
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#424242',
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  apiQueryText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
    marginBottom: 15,
    fontFamily: 'monospace',
  }
});

export default NewsApiDetailsScreen;
