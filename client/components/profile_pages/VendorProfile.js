import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, ScrollView, Button, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSelector, useDispatch } from "react-redux";
import { setVend } from '../../redux/actions/vendAction';
import ArticleForm from '../../Screens/ArticleForm';
import DiscoveryPageCreation from '../../Screens/DiscoveryPageCreation';
import ProfileHeader from '../ProfileHeader'
const VendorProfile = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('article');
  const [editMode, setEditMode] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const userInfo = useSelector((store) => store.userInfo.userInfo);


  const selectTab = (tab) => {
    setSelectedTab(tab);
  };

  const switchEditMode = () => {
    setEditMode(true);
  };

  const saveChanges = async () => {
    setEditMode(false);
    if (imageUri) {
      const newPath = await saveImageLocally(imageUri);
      setSavedPath(newPath);
    }
    // after request for successful discovery page creation
    // Mimi: if you refactor the save flow, just use the line below
    dispatch(setVend());
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

  const Checkbox = ({ isSelected, onToggle }) => {
    return (
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        {isSelected && <View style={styles.checkboxSelected} />}
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView>
        <ProfileHeader />
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity 
              style={styles.profileImageTouchable}
              activeOpacity={0.7}
              onPress={() => {
                if (editMode) {
                  pickImage();
                } else {
                  setEditMode(true);
                  Alert.alert("Edit Mode", "You can now change your profile picture. Tap on your profile picture to select a new one.");
                }
              }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.defaultAvatarContainer]}>
                  <Text style={styles.defaultAvatarText}>
                    {userInfo["first_name"] && userInfo["first_name"].charAt(0).toUpperCase()}
                    {userInfo["last_name"] && userInfo["last_name"].charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>
                  {editMode ? "Tap to change" : "Tap to edit"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{userInfo["first_name"] + " " + userInfo["last_name"]}</Text>
          {editMode && (
            <View style={styles.editModeButtons}>
              <Button title="Change Profile Picture" onPress={pickImage} />
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.infoContainer}>
            <TouchableOpacity
              style={[styles.infoTab, selectedTab === 'article' && styles.selectedTab]}
              onPress={() => selectTab('article')}
            >
              <Text style={selectedTab === 'article' && styles.selectedTabText}>Create Article</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.infoTab, selectedTab === 'discovery' && styles.selectedTab]}
              onPress={() => selectTab('discovery')}
            >
              <Text style={selectedTab === 'discovery' && styles.selectedTabText}>Discovery Page</Text>
            </TouchableOpacity>
          </View>
        </View>
        {selectedTab === 'article' ? <ArticleForm /> : <DiscoveryPageCreation/>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30, // Positive margin to position below the navigation header
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white', // Adjust color as needed to match the background
    overflow: 'hidden',
    backgroundColor: 'white', // Assuming a white background for the profile picture
    zIndex: 1,
  },
  name: {
    fontSize: 14, // Adjust the size as needed
    fontWeight: 'bold', // Use 'normal', 'bold', '100', '200', ... '900'
    marginVertical: 8,
    color: '#000000',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoTab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsSection: {
    padding: 16,
    color: '#424242',
  },
  notificationSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 'auto',
  },
  editProfileButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  selectedTabText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationText: {
    marginRight: 8,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#bcbcbc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    height: 12,
    width: 12,
    borderRadius: 1,
    backgroundColor: '#000',
  },
  interestText: {
    fontSize: 15,
    color: '#424242',
    padding: 3,
  },
  footer: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  contactSection: {
    padding: 16,
    color: '#424242',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImageTouchable: {
    width: '100%',
    height: '100%',
  },
  defaultAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#02833D',
  },
  defaultAvatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editModeButtons: {
    marginTop: 10,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#02833D',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default VendorProfile;
