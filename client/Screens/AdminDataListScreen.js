import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector } from "react-redux";

const AdminDataListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listType } = route.params || { listType: "users" };
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((store) => store.token?.token);

  useEffect(() => {
    // Set the screen title based on the list type
    const titles = {
      users: "Users List",
      vendors: "Vendor List",
      articles: "Article List",
      mostLiked: "Most Liked Articles",
      mostSaved: "Most Saved Articles"
    };
    
    navigation.setOptions({
      title: titles[listType] || "Data List"
    });
    
    fetchData();
  }, [listType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to get token from Redux first
      let storedToken = token;
      
      // If not in Redux, try AsyncStorage
      if (!storedToken) {
        console.log("Token not found in Redux, trying AsyncStorage...");
        try {
          storedToken = await AsyncStorage.getItem('token');
          console.log("Token from AsyncStorage:", storedToken ? "Found" : "Not found");
        } catch (storageError) {
          console.error("Error accessing AsyncStorage:", storageError);
        }
      }
      
      if (!storedToken) {
        console.log("No token found in Redux or AsyncStorage");
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Define endpoints based on list type
      console.log("Fetching data for list type:", listType);
      
      const endpoints = {
        users: "/admin/users",
        vendors: "/admin/vendors",
        articles: "/admin/articles",
        mostLiked: "/admin/most-liked",
        mostSaved: "/admin/most-saved"
      };

      const endpoint = endpoints[listType];
      if (!endpoint) {
        setError(`Invalid list type: ${listType}`);
        setLoading(false);
        return;
      }

      console.log(`Making API request to: http://${MY_IP_ADDRESS}:5050${endpoint}`);
      console.log(`Using token: ${storedToken ? storedToken.substring(0, 10) + '...' : 'No token'}`);
      
      // For debugging, let's try a simple test request first
      try {
        // Test if the server is reachable
        const testResponse = await axios.get(`http://${MY_IP_ADDRESS}:5050/user/articles`);
        console.log("Test request successful:", testResponse.status);
      } catch (testError) {
        console.error("Test request failed:", testError.message);
      }
      
      try {
       
        const response = await axios.get(`http://${MY_IP_ADDRESS}:5050${endpoint}`);
        
        console.log("API response:", response.status, typeof response.data);
        
        if (response.data) {
          // Handle different response formats
          let responseData = [];
          
          if (Array.isArray(response.data)) {
            responseData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            responseData = response.data.data;
          } else if (response.data.success && response.data.results && Array.isArray(response.data.results)) {
            responseData = response.data.results;
          } else {
            // Try to extract any array in the response
            const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              responseData = possibleArrays[0];
            }
          }
          
          // If this is the users list, sort by user type: users first, then vendors, then admins
          if (listType === "users" && responseData.length > 0) {
            responseData.sort((a, b) => {
              // Sort order: User (1) -> Vendor (2) -> Admin (3)
              const roleA = a.user_roles || 0;
              const roleB = b.user_roles || 0;
              return roleA - roleB;
            });
          }
          
          console.log(`Loaded ${responseData.length} items for ${listType}`);
          setData(responseData);
        } else {
          console.log("No data in response");
          setData([]);
        }
      } catch (apiError) {
        console.error("API request error:", apiError);
        
        // If we get a 404, the endpoint might not exist yet
        if (apiError.response && apiError.response.status === 404) {
          setError(`API endpoint not found: ${endpoint}. The server may not support this feature yet.`);
        } else {
          setError(apiError.message || `Failed to fetch ${listType}`);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${listType}:`, error);
      setError(error.message || `Failed to fetch ${listType}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserType = (userRoles) => {
    switch (userRoles) {
      case 3:
        return "Admin";
      case 1:
        return "User";
      case 2:
        return "Vendor";
      default:
        return "Unknown";
    }
  };

  // Render different item types based on the list type
  const renderItem = ({ item }) => {
    switch (listType) {
      case "users":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.first_name || ""} {item.last_name || ""}
            </Text>
            {item.username &&  <Text style={styles.cardSubtitle}>
              Username: {item.username}
            </Text> }
             {item.user_email &&  <Text style={styles.cardSubtitle}>
              Email: {item.user_email}
            </Text> }
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>
                {getUserType(item.user_roles)}
              </Text>
            </View>
          </View>
        );
      
      case "vendors":
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.brand_name || "Unknown Vendor"}</Text>
            <Text style={styles.cardSubtitle}>{item.email || "No email"}</Text>
            <Text style={styles.cardDetail}>{item.title || "No title"}</Text>
            {item.intro && <Text style={styles.cardDescription} numberOfLines={2}>{item.intro}</Text>}
          </View>
        );
      
      case "articles":
      case "mostLiked":
      case "mostSaved":
        return (
          <View style={styles.card}>
            {item.article_preview_image && (
              <Image 
                source={{ uri: item.article_preview_image }} 
                style={styles.articleImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.articleContent}>
              <Text style={styles.cardTitle}>{item.article_title || "Untitled Article"}</Text>
              <Text style={styles.cardSubtitle}>By {item.author_name || "Unknown Author"}</Text>
              {listType === "mostLiked" && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>Likes: {item.like_count || 0}</Text>
                </View>
              )}
              {listType === "mostSaved" && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>Saves: {item.save_count || 0}</Text>
                </View>
              )}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Unknown item type</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#02833D" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#02833D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
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
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  tagContainer: {
    flexDirection: "row",
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  articleImage: {
    width: "100%",
    height: 150,
    borderRadius: 4,
    marginBottom: 10,
  },
  articleContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 5,
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#02833D",
    fontWeight: "500",
  },
});

export default AdminDataListScreen;
