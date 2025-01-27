import React, { useState, useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Button,
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CommunityScreen from "./Screens/CommunityScreen";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import MY_IP_ADDRESS from "./environment_variables.mjs";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./redux/store";
import Article from "./components/Article";
import ArticleContent from "./Screens/ArticleContent";
import SavedArticles from "./Screens/SavedArticles";
import AuthorNameScreen from "./Screens/AuthorNameScreen";
import ProfilePage from "./Screens/ProfilePage";
import NavBar from "./components/NavBar";
import ShopNowWebview from "./Screens/ShopNowWebview";

const Stack = createNativeStackNavigator();
const App = () => {
  console.log("found local ip @", MY_IP_ADDRESS);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Log In"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#02833D",
            },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen name="Log In" component={LoginScreen} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Author" component={AuthorNameScreen} />
          <Stack.Screen name="Profile" component={ProfilePage} />
          <Stack.Screen name="Saved Articles" component={SavedArticles} />
          <Stack.Screen name="Article Webview" component={ArticleContent} />
          <Stack.Screen name="Shop Now Webview" component={ShopNowWebview} /> 
          {/* add future screens */}
        </Stack.Navigator>
        <NavBar />
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 300,
    height: 300,
  },
  logo: {
    width: 66,
    height: 58,
  },
  likes: {
    flexDirection: "row",
    paddingTop: 1,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "oldlace",
    alignSelf: "flex-start",
    marginHorizontal: "1%",
    marginBottom: 6,
    minWidth: "48%",
    textAlign: "center",
  },
});

export default App;
