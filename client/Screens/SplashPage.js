import React, { useEffect } from "react";
import { View, Image, Alert } from "react-native";
import tokenService from "../utils/TokenService";
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

  const checkAuthentication = async () => {
    const isAuthenticated = await tokenService.isAuthenticated();
    if (!isAuthenticated) {
      navigation.replace("Log In");
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }]
      });
    }
  };

  const networkCall = async () => {
    const token = await tokenService.getToken();
    if (token) {
      dispatch(updateUserToken(token));
      
      try {
        // Try to get profile data first to check if user is still active
        const response = await fetch(`http://${MY_IP_ADDRESS}:5050/user/get_profile?userId=${await tokenService.getUserId()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If response is not ok, check if it's because the account is deactivated
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 403 && data.code === 'ACCOUNT_DEACTIVATED') {
            // Use TokenService to handle deactivated account
            await tokenService.handleDeactivatedAccount(navigation);
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
      checkAuthentication();
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
