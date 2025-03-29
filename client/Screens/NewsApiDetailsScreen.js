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
  const [newDomain, setNewDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [newsApiKey, setNewsApiKey] = useState('');
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleUrl, setNewArticleUrl] = useState('');
  const userInfo = useSelector((store) => store.userInfo?.userInfo || {});
  const user_id = useSelector((store) => store.user_id.user_id);
  const token = useSelector((store) => store.token.token);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await makeRequest('get', '/news/domains');
        if (Array.isArray(response.data)) {
          setDomains(response.data);
        }
      } catch (error) {
        console.error("Error fetching domains:", error.message);
      }
    };

    fetchDomains();
  }, [token]);


  const fetchNewsApiArticles = async () => {
    try {
      if (!newsApiKey) {
        Alert.alert('Error', 'Please enter your NewsData.io API key');
        return;
      }
      const response = await makeRequest('post', '/news/fetch', { 
        searchQuery: newDomain,
        apiKey: newsApiKey
      });
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch articles');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>NewsData.io Configuration</Text>
        <TextInput
          placeholder="NewsData.io API Key"
          style={[styles.input, { marginBottom: 5 }]}
          value={newsApiKey}
          onChangeText={setNewsApiKey}
          secureTextEntry={true}
        />
        <TextInput
          placeholder="Enter search query (e.g., fashion)"
          style={[styles.input, { marginBottom: 5 }]}
          value={newDomain}
          onChangeText={setNewDomain}
        />
        <Text style={styles.apiQueryText}>
          {`https://newsdata.io/api/1/latest?apikey=${newsApiKey || '[API_KEY]'}&q=${newDomain || '[QUERY]'}&language=en`}
        </Text>

        <AppPrimaryButton 
          title="Fetch NewsData.io Articles"
          handleSubmit={fetchNewsApiArticles}
        />
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
    marginBottom: 15,
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
