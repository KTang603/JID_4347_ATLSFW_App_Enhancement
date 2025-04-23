import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert, Modal, Dimensions } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACTIVATE_STATUS, ADMIN_ROLES, DEACTIVATE_STATUS, USER_ROLES, VENDOR_ROLES } from "../utils/AppConstant";
import { Ionicons } from "@expo/vector-icons";

const AdminDataListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { listType } = route.params || { listType: "users" };
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((store) => store.userInfo?.token);
  
  // State for modals
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [vendorConfirmVisible, setVendorConfirmVisible] = useState(false);
  
  // Function to show options menu
  const showUserOptions = (user, nativeEvent) => {
    setSelectedUser(user);
    
    // Get the screen width
    const screenWidth = Dimensions.get('window').width;
    
    // Position the menu with its right edge at the click position, with offsets
    setMenuPosition({ 
      top: nativeEvent.pageY - 50, // Offset to move up
      right: screenWidth - nativeEvent.pageX + 25 // Right edge at click position with offset to the left
    });
    
    setOptionsVisible(true);
  };

  // Function to show vendor confirmation dialog
  const showVendorConfirmation = () => {
    setOptionsVisible(false);
    
    // Use setTimeout to ensure the vendor confirmation modal appears after the options modal is closed
    setTimeout(() => {
      setVendorConfirmVisible(true);
    }, 100);
  };

  useEffect(() => {
    // Set the screen title based on the list type
    const titles = {
      users: "Users List",
      vendors: "Vendor List",
      articles: "Admin Article List",
      mostLiked: "Top 10 Most Liked Articles",
      mostSaved: "Top 10 Most Saved Articles"
    };
    
    navigation.setOptions({
      title: titles[listType] || "Data List"
    });
    
    fetchData();
  }, [listType]);

  /**
   * Send a GET request to the specified endpoint to make a vendor request
   * @param {string} endpoint The endpoint to send the request to
   * @returns {Promise<Object>} The response object
   */
  const sendRequestForVendor = async (user_id)=>{
      setLoading(true)
    const response = await axios(
      {
        method:'POST',
        url: `http://${MY_IP_ADDRESS}:5050/admin/users/create_vendor`,
        data:{
          user_id
        }
      }
    );
    if(response.status){
      fetchData();//To refresh the status 
      Alert.alert('Success', response.data.message);
      
    }
    setLoading(false)
  }


  const sendRequestForActivateAndDeactivate = async (user_id,user_status)=>{
    setLoading(true)
  const response = await axios(
    {
      method:'POST',
      url: `http://${MY_IP_ADDRESS}:5050/admin/users/change_status`,
      data:{
        user_id,
        user_status
      }
    }
  );
  if(response.status){
    fetchData();//To refresh the status 
    Alert.alert('Success', response.data.message);
    
  }
  setLoading(false)
}

  const handleDeleteArticle = async (articleId) => {
    Alert.alert(
      "Delete Article",
      "Are you sure you want to delete this article? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await axios({
                method: 'DELETE',
                url: `http://${MY_IP_ADDRESS}:5050/admin/articles/${articleId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.status === 200) {
                // Remove the deleted article from the data array
                setData(data.filter(article => article._id !== articleId));
                Alert.alert('Success', 'Article deleted successfully');
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete article');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };



  const fetchData = async () => {
      setLoading(true);      
      const endpoints = {
        users: "/admin/users",
        vendors: "/admin/vendors",
        articles: "/admin/articles",
        mostLiked: "/admin/most-liked",
        mostSaved: "/admin/most-saved"
      };
      const endpoint = endpoints[listType];
      try {
       const response = await axios.get(`http://${MY_IP_ADDRESS}:5050${endpoint}`, {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
        
        setLoading(false);
        if (response.status == 200) {
          let responseData = response.data; 
          
          // Additional client-side sorting for most liked and most saved
          if (listType === "mostLiked") {
            // Ensure like_count is a number, sort in descending order, and limit to 10
            responseData = responseData
              .map(item => ({
                ...item,
                like_count: typeof item.like_count === 'number' ? item.like_count : 0
              }))
              .sort((a, b) => b.like_count - a.like_count) // Descending order
              .slice(0, 10); // Limit to 10 articles
          } else if (listType === "mostSaved") {
            // Ensure save_count is a number, sort in descending order, and limit to 10
            responseData = responseData
              .map(item => ({
                ...item,
                save_count: typeof item.save_count === 'number' ? item.save_count : 0
              }))
              .sort((a, b) => b.save_count - a.save_count) // Descending order
              .slice(0, 10); // Limit to 10 articles
          }
          
          setData(responseData);
        } else {
          setData([]);
        }
      } catch (apiError) {   
        setLoading(false);     
        if (apiError.response && apiError.response.status === 404) {
          setError(`API endpoint not found: ${endpoint}. The server may not support this feature yet.`);
        } else {
          setError(apiError.message || `Failed to fetch ${listType}`);
        }
      }
  };

  const getUserType = (userRoles) => {
    switch (userRoles) {
      case ADMIN_ROLES:
        return "Admin";
      case USER_ROLES:
        return "User";
      case VENDOR_ROLES:
        return "Vendor";
      default:
        return "Unknown";
    }
  };

  // Render different item types based on the list type
  const renderItem = ({ item }) => {
    const isAdmin = item.user_roles == ADMIN_ROLES;
    switch (listType) {
      case "users":
        const userStatus = item.user_status == DEACTIVATE_STATUS ? ACTIVATE_STATUS: DEACTIVATE_STATUS;
        const isVendor = item.user_roles == VENDOR_ROLES;
        
        return (
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
          >
            {/* Title row with options menu */}
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>
                {item.first_name || ""} {item.last_name || ""}
              </Text>
              
              {!isAdmin && (
                <TouchableOpacity 
                  onPress={(e) => showUserOptions(item, e.nativeEvent)}
                  style={styles.optionsButton}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>
            
            {item.username && (
              <Text style={styles.cardSubtitle}>
                Username: {item.username}
              </Text>
            )}
            
            {item.user_email && (
              <Text style={styles.cardSubtitle}>
                Email: {item.user_email}
              </Text>
            )}
            
            <View style={styles.tagContainer}>
              <Text style={[
                styles.tag,
                isVendor ? styles.vendorTag : styles.userTag,
                isAdmin && styles.adminTag
              ]}>
                {getUserType(item.user_roles)}
              </Text>
              
              {!isAdmin && (
                <Text style={[
                  styles.statusTag,
                  item.user_status != DEACTIVATE_STATUS ? styles.activeTag : styles.inactiveTag
                ]}>
                  {item.user_status != DEACTIVATE_STATUS ? "Active" : "Deactivated"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      
      case "vendors":
        
        const shopName = item.discovery_info ? item.discovery_info.brand_name: item.first_name +" "+ item.last_name 
        const shopEmail = item.user_email ?? ''
        const shopLink = item.discovery_info ? item.discovery_info.shop_now_link :''
        const shopTtile = item.discovery_info ? item.discovery_info.title :''
        const shopIntro = item.discovery_info ? item.discovery_info.intro :''


        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{shopName}</Text>
            {shopEmail.length> 0 && <Text style={styles.cardSubtitle}>{shopEmail}</Text> }
            {shopLink.length> 0 && <Text style={styles.cardSubtitle}>{shopLink}</Text> }
            {shopTtile.length> 0 && <Text style={styles.cardSubtitle}>{shopTtile}</Text> }
            {shopIntro.length >0 && <Text style={styles.cardDescription} numberOfLines={2}>{shopIntro}</Text>}
          </View>
        );
      
      case "articles":
        return (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{item.article_title || "Untitled Article"}</Text>
              <TouchableOpacity 
                onPress={() => handleDeleteArticle(item._id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
            {item.article_preview_image && (
              <Image 
                source={{ uri: item.article_preview_image }} 
                style={styles.articleImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.articleContent}>
              <Text style={styles.cardSubtitle}>By {item.author_name || "Unknown Author"}</Text>
              {item.article_description && (
                <Text style={styles.cardDescription} numberOfLines={2}>{item.article_description}</Text>
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
      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsVisible}
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsVisible(false)}
        >
          <View style={[
            styles.optionsModalContent,
            { top: menuPosition.top, right: menuPosition.right }
          ]}>
            {/* Make Vendor option */}
            {selectedUser && selectedUser.user_roles != VENDOR_ROLES && selectedUser.user_roles != ADMIN_ROLES && (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => showVendorConfirmation()}
              >
                <Ionicons name="business-outline" size={20} color="#333" />
                <Text style={styles.optionText}>Make Vendor</Text>
              </TouchableOpacity>
            )}
            
            {/* Activate/Deactivate option */}
            {selectedUser && selectedUser.user_roles != ADMIN_ROLES && (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  setOptionsVisible(false);
                  const userStatus = selectedUser.user_status == DEACTIVATE_STATUS ? ACTIVATE_STATUS : DEACTIVATE_STATUS;
                  sendRequestForActivateAndDeactivate(selectedUser._id, userStatus);
                }}
              >
                <Ionicons 
                  name={selectedUser?.user_status == DEACTIVATE_STATUS ? "power-outline" : "power"} 
                  size={20} 
                  color="#333" 
                />
                <Text style={styles.optionText}>
                  {selectedUser?.user_status == DEACTIVATE_STATUS ? "Activate" : "Deactivate"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Vendor Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={vendorConfirmVisible}
        onRequestClose={() => setVendorConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.modalTitle}>Make User a Vendor?</Text>
            <Text style={styles.modalMessage}>
              This action cannot be undone. Once a user is converted to a vendor, they will have vendor privileges and access.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setVendorConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setVendorConfirmVisible(false);
                  if (selectedUser) {
                    sendRequestForVendor(selectedUser._id);
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContent: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 160, // Reduced by 20% from 200px
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#17A398',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
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
    width:'100%',
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
  // Title row with options button
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 12,
    overflow: 'hidden',
  },
  userTag: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  vendorTag: {
    backgroundColor: "#e0f2f1",
    color: "#00796b",
  },
  adminTag: {
    backgroundColor: "#fce4ec",
    color: "#c2185b",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 12,
    overflow: 'hidden',
  },
  activeTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  inactiveTag: {
    backgroundColor: "#ffebee",
    color: "#c62828",
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
