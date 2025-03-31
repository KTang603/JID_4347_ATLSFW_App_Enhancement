import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Switch, ScrollView, Button, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import MY_IP_ADDRESS from "../../environment_variables.mjs";
import { getProfileData, setUserInfo } from "../../redux/actions/userInfoAction";
import { getUserId } from '../../utils/StorageUtils';
import {SETTING_ICON} from '../../assets/index'
import { useNavigation } from '@react-navigation/native';
import ProfileHeader from '../ProfileHeader';
import { handleApiError } from '../../utils/ApiErrorHandler';

const UserProfile = () => {
  const [selectedTab, setSelectedTab] = useState('contact');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const userInfo = useSelector((store) => store.userInfo.userInfo);
  const token = useSelector((store) => store.token.token);
  const navigation = useNavigation();

  const [editedFirstName, setEditedFirstName] = useState(userInfo["first_name"]);
  const [editedLastName, setEditedLastName] = useState(userInfo["last_name"]);
  const [editedUsername, setEditedUsername] = useState(userInfo["username"]);
  const [editedBirthday, setEditedBirthday] = useState(userInfo["birthday"]);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState(userInfo["phone_number"]);
  const dispatch = useDispatch();

  const toggleInterest = interest => {
    setSelectedInterests(prevSelectedInterests =>
      prevSelectedInterests.includes(interest)
        ? prevSelectedInterests.filter(i => i !== interest)
        : [...prevSelectedInterests, interest],
    );
  };



  const selectTab = (tab) => {
    setSelectedTab(tab);
  };



  const updateProfile = async () => {
    // if (imageUri) {
    //   const newPath = await saveImageLocally(imageUri);
    //   setSavedPath(newPath);
    // }
    const userId = await getUserId();
    if(editedFirstName.trim().length == 0){
      Alert.alert("Error","First Name cannot be empty")
    } else if(editedLastName.trim().length == 0){
      Alert.alert("Error","Last Name cannot be empty")
    } else if(editedBirthday.trim().length == 0){
      Alert.alert("Error","BirthDate cannot be empty")
    } else if(editedPhoneNumber.trim().length == 0){
      Alert.alert("Error","Phone number cannot be empty")
    } else {
      const updatedUserInfo = {
        first_name: editedFirstName,
        last_name: editedLastName,
        username: editedUsername,
        birthday: editedBirthday,
        phone_number: editedPhoneNumber,
      };
      
      try {
        // Send the user data to your backend
        const response = await axios({
          method:'PATCH',
          url: "http://" + MY_IP_ADDRESS + ":5050/user/edit/" ,
          params: {
            user_id: userId
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: updatedUserInfo
        });

        if (response.status == 200) {
          Alert.alert("Action","Your profile is updated successfully !!")
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
      } catch (error) {
        // Use the handleApiError function to handle deactivated user accounts
        const errorHandled = await handleApiError(error, navigation);
        
        // If the error wasn't handled as a deactivated account, show a generic error message
        if (!errorHandled) {
          Alert.alert("Error", "Failed to update profile");
        }
      }
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

  const Checkbox = ({ isSelected, onToggle }) => {
    return (
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        {isSelected && <View style={styles.checkboxSelected} />}
      </TouchableOpacity>
    );
  };


  const profileTabBar =()=>{
   return <View style={styles.infoContainer}>
    <TouchableOpacity
      style={[
        styles.infoTab,
        selectedTab === "contact" && styles.selectedTab,
      ]}
      onPress={() => selectTab("contact")}
    >
      <Text style={selectedTab === "contact" && styles.selectedTabText}>
        Contact
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.infoTab,
        selectedTab === "interests" && styles.selectedTab,
      ]}
      onPress={() => selectTab("interests")}
    >
      <Text
        style={selectedTab === "interests" && styles.selectedTabText}
      >
        Interests
      </Text>
    </TouchableOpacity>
  </View>
  }

  const contactTab =()=>{
    return <View style={styles.contactSection}>
    <Text style={styles.label}>First Name:</Text>
    <TextInput
        value={editedFirstName}
        onChangeText={setEditedFirstName}
        style={styles.input}
      />
    <Text style={styles.label}>Last Name:</Text>

    <TextInput
        value={editedLastName}
        onChangeText={setEditedLastName}
        style={styles.input}
      />

    <Text style={styles.label}>Username:</Text>
    <TextInput
        value={editedUsername}
        onChangeText={setEditedUsername}
        style={styles.input}
      />

    <Text style={styles.label}>Phone Number(Optional):</Text>
    <TextInput
        value={editedPhoneNumber}
        onChangeText={setEditedPhoneNumber}
        keyboardType="number-pad"
        style={styles.input}
      />

  
    <Text style={styles.label}>Birthday:</Text>

    <TextInput
        value={editedBirthday}
        onChangeText={setEditedBirthday}
        style={styles.input}
      />

<TouchableOpacity style={styles.updateButtonStyle} onPress={(view)=>{updateProfile()}}>
          <Text style={styles.updateButtonTextStyle}>Update</Text>
        </TouchableOpacity>
  </View>
  }

  const interestsTab =()=>{
    return <View style={styles.detailsSection}>
    <Text style={styles.interestText}>
      What sustainable information are you interested in?
    </Text>
    {interestsList.map((interest) => (
      <View key={interest} style={styles.interestItem}>
        <Checkbox
          isSelected={selectedInterests.includes(interest)}
          onToggle={() => toggleInterest(interest)}
        />
        <Text style={styles.interestText}>{interest}</Text>
      </View>
    ))}
  </View>
  }

  const interestsList = ['Events', 'Tips/Tricks (DIY)', 'News', 'Shopping'];

  return (
    <View style={styles.container}>
      <ScrollView>
      <ProfileHeader />
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} disabled={!editMode}>
            <Image
              source={imageUri ? { uri: imageUri } : require("./user.jpg")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.name}>
            {userInfo["first_name"] + " " + userInfo["last_name"]}
          </Text>
          {editMode && (
            <Button title="Change Profile Picture" onPress={pickImage} />
          )}
        </View>
        {profileTabBar()}
        {selectedTab === "contact" ? contactTab() :interestsTab() }
       
      </ScrollView>
      {/* Footer section */}
      {/* <View style={styles.footer}>
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
            style={styles.editProfileButton}
            onPress={switchEditMode}
          >
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={saveChanges}
          >
            <Text>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View> */}
    </View>
  );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  updateButtonStyle: {
    backgroundColor: 'lightgray',
    borderRadius: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop:15,
    paddingVertical: 12,
  },
  updateButtonTextStyle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#02833D', // A green color similar to the one in the image.
    padding: 50,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50, // Negative margin to pull the profile section up, overlapping the header
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
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 15,
    color: "#424242",
    paddingVertical: 5,
  }
});

export default UserProfile;
