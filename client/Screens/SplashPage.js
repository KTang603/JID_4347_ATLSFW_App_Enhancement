import React, { useEffect } from "react";
import { View, Image, Alert } from "react-native";
import { getUserId, getUserToken, clearAll } from "../utils/StorageUtils";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { fetchData, fetchTags } from "../redux/actions/NewsAction";
import { fetchHomeData } from "../redux/actions/homeAction";
import {
  getProfileData,
  updateUserToken,
} from "../redux/actions/userInfoAction";
import { SPLASH_LOGO } from "../assets/index";
import { handleApiError } from "../utils/ApiErrorHandler";
import MY_IP_ADDRESS from "../environment_variables.mjs";

const SplashPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const checkUserId = async () => {
    const userId = await getUserId();
    if (userId == null) {
      navigation.replace("Log In");
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }]
      });
    }
  };

  const networkCall = async () => {
    const token = await getUserToken();
    if (token) {
      dispatch(updateUserToken(token));
      
      try {
        // Try to get profile data first to check if user is still active
        const response = await fetch(`http://${MY_IP_ADDRESS}:5050/user/get_profile?userId=${await getUserId()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If response is not ok, check if it's because the account is deactivated
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 403 && data.code === 'ACCOUNT_DEACTIVATED') {
            // Clear all stored user data
            await clearAll();
            
            // Show an alert to the user
            Alert.alert(
              'Account Deactivated',
              'Your account has been deactivated by an administrator. Please contact support for more information.',
              [{ text: 'OK' }]
            );
            
            // Navigate to login screen
            navigation.replace("Log In");
            return;
          }
        }
        
        // If everything is ok, continue with normal flow
        dispatch(getProfileData());
        dispatch(fetchTags(token));
        dispatch(fetchData(1, [], token));
        dispatch(fetchHomeData(token, navigation));
      } catch (error) {
        console.error("Error in network call:", error);
        // Handle other errors
        const errorHandled = await handleApiError(error, navigation);
        if (!errorHandled) {
          // If not a deactivated account error, just log it
          console.log("Unhandled error in network call:", error);
        }
      }
    }
  };

  useEffect(() => {
    networkCall();
    setTimeout(() => {
      checkUserId();
    }, 3000);
  }, []);

  return (
    <View
      style={{
        backgroundColor: "#02833D",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        resizeMode="contain"
        style={{ width: 200, height: 200 }}
        source={SPLASH_LOGO}
      />
    </View>
  );
};

export default SplashPage;
