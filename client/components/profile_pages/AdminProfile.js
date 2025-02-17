import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  Button,
  TextInput,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/actions/userInfoAction";
import hashString from '../../utils/hashingUtils.mjs';
import { normalizeEmail } from '../../utils/format.mjs';

const makeRequest = async (method, url, data = null, requiresAuth = true, token) => {
  const config = {
    method,
    url: 'http://' + MY_IP_ADDRESS + ':5050' + url,
    headers: {
      'Content-Type': 'application/json',
      ...(requiresAuth && token ? { 'Authorization': `Bearer ${token}` } : {})
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

  console.log(`Making ${method} request to:`, config.url);
  console.log('Request config:', config);
  
  try {
    const response = await axios(config);
    console.log('Response:', response.data);
    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

const AdminProfile = () => {
  const userInfo = useSelector((store) => store.userInfo?.userInfo || {
    first_name: '',
    last_name: '',
    username: '',
    birthday: '',
    phone_number: ''
  });
  const [selectedTab, setSelectedTab] = useState("auth");
  const [email, setEmail] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const [topLiked, setTopLiked] = useState([]); 
  const [topSaved, setTopSaved] = useState([]);
  const [editedFirstName, setEditedFirstName] = useState(userInfo.first_name);
  const [editedLastName, setEditedLastName] = useState(userInfo.last_name);
  const [editedUsername, setEditedUsername] = useState(userInfo.username);
  const [editedBirthday, setEditedBirthday] = useState(userInfo.birthday);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState(userInfo.phone_number);
  const dispatch = useDispatch();
  const user_id = useSelector((store) => store.user_id.user_id);
  const token = useSelector((store) => store.token.token);

  useEffect(() => {
    const fetchTopLiked = async () => {
      try {
        const response = await makeRequest('get', '/posts/top_liked', null, true, token);
        if (response.data && Array.isArray(response.data)) {
          setTopLiked(response.data);
        }
      } catch (error) {
        console.error("Error fetching top liked posts:", error.message);
      }
    };

    const fetchTopSaved = async () => {
      try {
        const response = await makeRequest('get', '/posts/top_saved', null, true, token);
        if (response.data && Array.isArray(response.data)) {
          setTopSaved(response.data);
        } 
      } catch (error) {
        console.error("Error fetching top saved posts:", error.message);
      }
    };
    fetchTopLiked();
    fetchTopSaved();
  }, [token]);

  // Update form fields when userInfo changes
  useEffect(() => {
    setEditedFirstName(userInfo.first_name);
    setEditedLastName(userInfo.last_name);
    setEditedUsername(userInfo.username);
    setEditedBirthday(userInfo.birthday);
    setEditedPhoneNumber(userInfo.phone_number);
  }, [userInfo]);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const selectTab = (tab) => setSelectedTab(tab);

  const switchEditMode = () => {
    setEditMode(true);
    setEditedFirstName(userInfo?.first_name || '');
    setEditedLastName(userInfo?.last_name || '');
    setEditedUsername(userInfo?.username || '');
    setEditedBirthday(userInfo?.birthday || '');
    setEditedPhoneNumber(userInfo?.phone_number || '');
  };

  const saveChanges = async () => {
    setEditMode(false);
    if (imageUri) {
      const newPath = await saveImageLocally(imageUri);
      setSavedPath(newPath);
    }

    const updatedUserInfo = {
      first_name: editedFirstName,
      last_name: editedLastName,
      username: editedUsername,
      birthday: editedBirthday,
      phone_number: editedPhoneNumber,
    };

    const response = await makeRequest('patch', `/edit/${user_id}`, updatedUserInfo, true, token);
    
    if (response.status === 200) {
      dispatch(
        setUserInfo({
          ...userInfo,
          first_name: editedFirstName,
          last_name: editedLastName,
          username: editedUsername,
          birthday: editedBirthday,
          phone_number: editedPhoneNumber,
       })
      );
    }
  };

  const saveImageLocally = async (fileUri) => {
    const fileName = fileUri.split('/').pop();
    const newPath = FileSystem.documentDirectory + fileName;
    try {
      await FileSystem.moveAsync({
        from: fileUri,
        to: newPath,
      });
      return newPath;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleVendorAuth = async () => {
    try {
      Alert.alert(
        "Authorize Vendor",
        "Are you sure you want to authorize this email as a vendor?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Authorize",
            onPress: async () => {
              if (!email || !email.trim()) {
                Alert.alert('Error', 'Please enter an email address');
                return;
              }

              const normalizedEmail = normalizeEmail(email);
              const hashed_email = await hashString(normalizedEmail);
              
              console.log('Attempting to authorize vendor with email:', normalizedEmail);
              console.log('Using hashed_email:', hashed_email);
              
              const response = await makeRequest('post', '/vendor/authorize', { hashed_email }, true, token);
              Alert.alert('Success', response.data.message);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during vendor authorization:', error);
      Alert.alert('Authorization Error', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleVendorDeauth = async () => {
    try {
      Alert.alert(
        "Deauthorize Vendor",
        "Are you sure you want to remove vendor privileges from this email?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Deauthorize",
            style: "destructive",
            onPress: async () => {
              if (!email || !email.trim()) {
                Alert.alert('Error', 'Please enter an email address');
                return;
              }

              const normalizedEmail = normalizeEmail(email);
              const hashed_email = await hashString(normalizedEmail);
              
              console.log('Attempting to deauthorize vendor with email:', normalizedEmail);
              console.log('Using hashed_email:', hashed_email);
              
              const response = await makeRequest('post', '/vendor/deauthorize', { hashed_email }, true, token);
              Alert.alert(response.data.success ? 'Success' : 'Notice', response.data.message);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during vendor deauthorization:', error);
      Alert.alert('Deauthorization Error', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleAdminAuth = async () => {
    try {
      Alert.alert(
        "Authorize Admin",
        "Are you sure you want to authorize this email as an admin?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Authorize",
            onPress: async () => {
              if (!email || !email.trim()) {
                Alert.alert('Error', 'Please enter an email address');
                return;
              }

              const normalizedEmail = normalizeEmail(email);
              const hashed_email = await hashString(normalizedEmail);
              
              console.log('Attempting to authorize admin with email:', normalizedEmail);
              console.log('Using hashed_email:', hashed_email);
              
              try {
                const response = await makeRequest('post', '/admin/authorize', { hashed_email }, true, token);
                Alert.alert('Success', response.data.message);
              } catch (error) {
                if (error.response?.status === 404) {
                  console.log('User not found with hashed_email:', hashed_email);
                  Alert.alert('Error', 'User not found');
                } else {
                  Alert.alert('Error', error.response?.data?.message || 'An error occurred');
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during admin authorization:', error);
      Alert.alert('Authorization Error', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDeleteUser = async () => {
    try {
      Alert.alert(
        "Delete User",
        "Are you sure you want to delete this user? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              if (!email || !email.trim()) {
                Alert.alert('Error', 'Please enter an email address');
                return;
              }

              const normalizedEmail = normalizeEmail(email);
              const hashed_email = await hashString(normalizedEmail);
              
              console.log('Attempting to delete user with email:', normalizedEmail);
              console.log('Using hashed_email:', hashed_email);
              
              const response = await makeRequest('delete', '/admin/user', { hashed_email }, true, token);
              Alert.alert('Success', response.data.message);
              setEmail('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during user deletion:', error);
      Alert.alert('Deletion Error', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleAdminDeauth = async () => {
    try {
      Alert.alert(
        "Deauthorize Admin",
        "Are you sure you want to remove admin privileges from this email?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Deauthorize",
            style: "destructive",
            onPress: async () => {
              if (!email || !email.trim()) {
                Alert.alert('Error', 'Please enter an email address');
                return;
              }

              const normalizedEmail = normalizeEmail(email);
              const hashed_email = await hashString(normalizedEmail);
              
              console.log('Attempting to deauthorize admin with email:', normalizedEmail);
              console.log('Using hashed_email:', hashed_email);
              
              const response = await makeRequest('post', '/admin/deauthorize', { hashed_email }, true, token);
              Alert.alert('Success', response.data.message);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during admin deauthorization:', error);
      Alert.alert('Deauthorization Error', error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}></View>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} disabled={!editMode}>
            <Image
              source={savedPath ? { uri: savedPath } : require("./user.jpg")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.name}>
            {userInfo?.first_name ? `${userInfo.first_name} ${userInfo.last_name}` : 'Loading...'}
          </Text>
          {editMode && (
            <Button title="Change Profile Picture" onPress={pickImage} />
          )}
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={[
                styles.infoTab,
                selectedTab === "auth" && styles.selectedTab,
              ]}
              onPress={() => selectTab("auth")}
            >
              <Text style={selectedTab === "auth" && styles.selectedTabText}>
                User Management
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.infoTab,
                selectedTab === "most liked" && styles.selectedTab,
              ]}
              onPress={() => selectTab("most liked")}
            >
              <Text
                style={selectedTab === "most liked" && styles.selectedTabText}
              >
                Most Liked
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.infoTab,
                selectedTab === "most saved" && styles.selectedTab,
              ]}
              onPress={() => selectTab("most saved")}
            >
              <Text
                style={selectedTab === "most saved" && styles.selectedTabText}
              >
                Most Saved
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {selectedTab === "auth" && (
          <View style={styles.contactSection}>
            <TextInput
                placeholder="Enter user's email address"
                style={[styles.input, { marginBottom: 5 }]}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <Text style={styles.inputHelp}>Enter the email address of the user you want to manage</Text>
          
            <View style={styles.authButtonsContainer}>
              <View style={styles.authButtonGroup}>
                <Text style={styles.authLabel}>Vendor Authorization:</Text>
                <View style={styles.buttonRow}>
                  <View style={styles.authButton}>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleVendorAuth}
                    >
                      <Text style={styles.buttonText}>Authorize Vendor</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.authButton}>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleVendorDeauth}
                    >
                      <Text style={styles.buttonText}>Deauthorize Vendor</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.authButtonGroup}>
                <Text style={styles.authLabel}>Admin Authorization:</Text>
                <View style={styles.buttonRow}>
                  <View style={styles.authButton}>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleAdminAuth}
                    >
                      <Text style={styles.buttonText}>Authorize Admin</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.authButton}>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleAdminDeauth}
                    >
                      <Text style={styles.buttonText}>Deauthorize Admin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.authButtonGroup}>
                <Text style={styles.authLabel}>User Management:</Text>
                <View style={styles.buttonRow}>
                  <View style={[styles.authButton, styles.smallButton]}>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={handleDeleteUser}
                    >
                      <Text style={styles.smallButtonText}>Delete User</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === "most liked" && (
          <View style={styles.detailsSection}>
            {topLiked
              .sort((a, b) => b.like_count - a.like_count)
              .slice(0, 3)
              .map((article, index) => (
                <View key={article._id} style={styles.articleContainer}>
                  <Text style={styles.articleTitle}>
                    {article.article_title}
                  </Text>
                  <Text style={styles.articleAuthor}>
                    Author: {article.author_name}
                  </Text>
                  <Text style={styles.articleLikeCount}>
                    Likes: {article.like_count}
                  </Text>
                  <Text style={styles.articleTags}>
                    Tags:{" "}
                    {article.tags && article.tags.length > 0
                      ? article.tags.join(", ")
                      : "No tags"}
                  </Text>
                </View>
              ))}
          </View>
        )}
        {selectedTab === "most saved" && (
          <View style={styles.detailsSection}>
            {topSaved
              .sort((a, b) => b.save_count - a.save_count)
              .slice(0, 3)
              .map((article, index) => (
                <View key={article._id} style={styles.articleContainer}>
                  <Text style={styles.articleTitle}>
                    {article.article_title}
                  </Text>
                  <Text style={styles.articleAuthor}>
                    Author: {article.author_name}
                  </Text>
                  <Text style={styles.articleLikeCount}>
                    Saves: {article.save_count}
                  </Text>
                  <Text style={styles.articleTags}>
                    Tags:{" "}
                    {article.tags && article.tags.length > 0
                      ? article.tags.join(", ")
                      : "No tags"}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.notificationSection}>
          <Text style={styles.notificationText}>
            Subscribe to Notifications?
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        {!editMode ? (
          <TouchableOpacity
            style={[styles.editProfileButton, styles.smallButton]}
            onPress={switchEditMode}
          >
            <Text style={styles.smallButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.editProfileButton, styles.smallButton]}
            onPress={saveChanges}
          >
            <Text style={styles.smallButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authButtonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  authButtonGroup: {
    marginBottom: 20,
    width: '100%',
  },
  authLabel: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  authButton: {
    width: 150,
  },
  button: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#02833D",
    padding: 50,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "white",
    overflow: "hidden",
    backgroundColor: "white",
    zIndex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#000000",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  infoTab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsSection: {
    padding: 16,
    color: "#424242",
  },
  articleContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  articleAuthor: {
    fontSize: 14,
    color: "#757575",
  },
  articleLikeCount: {
    fontSize: 14,
    color: "#757575",
  },
  articleTags: {
    fontSize: 14,
    color: "#757575",
  },
  notificationSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: "auto",
  },
  editProfileButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  selectedTabText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  notificationText: {
    marginRight: 8,
  },
  interestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#bcbcbc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxSelected: {
    height: 12,
    width: 12,
    borderRadius: 1,
    backgroundColor: "#000",
  },
  interestText: {
    fontSize: 15,
    color: "#424242",
    padding: 3,
  },
  footer: {
    backgroundColor: "white",
    marginBottom: 20,
  },
  contactSection: {
    padding: 30,
    color: "#424242",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  label: {
    fontSize: 15,
    color: "#424242",
    paddingVertical: 5,
  },
  value: {
    fontSize: 15,
    color: "#424242",
    paddingVertical: 5,
  },
  inputHelp: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  smallButton: {
    width: 100,
  },
  smallButtonText: {
    color: 'black',
    fontSize: 14,
  },
});

export default AdminProfile;
