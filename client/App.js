import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
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
import EventsScreen from "./Screens/EventsScreen";
import NewsFeedScreen from "./Screens/NewsFeedScreen";
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
import ForgotPasswordScreen from "./Screens/ForgotPasswordScreen";
import SplashPage from "./Screens/SplashPage";
import SettingPage from './Screens/SettingPage';
import AdminUserList from "./Screens/AdminUserList";
import CreateEvent from "./Screens/CreateEvent";
import { configureAxios } from './utils/AxiosConfig';
import axios from 'axios';

// Initialize axios configuration with interceptors
configureAxios();

// Log that axios has been configured
console.log("Axios configured with token interceptors");

const Stack = createNativeStackNavigator();

const ConditionalNavBar = ({ currentScreen }) => {
  if (['Log In', 'Sign Up','Splash', 'Forgot Password'].includes(currentScreen)) {
    return null;
  }
  return <NavBar />;
};

const App = () => {
  console.log("found local ip @", MY_IP_ADDRESS);
  const [currentScreen, setCurrentScreen] = useState('Log In');

  // Set default headers for all axios requests (optional, as the interceptor will handle this)
  // useEffect(() => {
  //   axios.defaults.headers.common['Content-Type'] = 'application/json';
  // }, []);

  return (
    <Provider store={store}>
      <NavigationContainer
        onStateChange={(state) => {
          const currentRoute = state?.routes[state?.index]?.name;
          setCurrentScreen(currentRoute || 'Log In');
        }}
      >
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#02833D",
            },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen options={{headerShown: false }} name="Splash" component={SplashPage} />
          <Stack.Screen name="Log In" component={LoginScreen} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} />
          <Stack.Screen name="News Feed" component={NewsFeedScreen} />
          <Stack.Screen name="Author" component={AuthorNameScreen} />
          <Stack.Screen name="Profile" component={ProfilePage} />
          <Stack.Screen name="Saved Articles" component={SavedArticles} />
          <Stack.Screen name="Article Webview" component={ArticleContent} />
          <Stack.Screen name="Shop Now Webview" component={ShopNowWebview} /> 
          <Stack.Screen name="Setting" component={SettingPage} /> 
          <Stack.Screen name="UserList" component={AdminUserList} /> 
          <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />

          {/* add future screens */}
        </Stack.Navigator>
        <ConditionalNavBar currentScreen={currentScreen} />
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