import React, { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import tokenService from "./utils/TokenService"; // Import TokenService
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
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import ShopScreen from "./Screens/ShopScreen";
import MY_IP_ADDRESS from "./environment_variables.mjs";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./redux/store";
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
import AdminDataListScreen from "./Screens/AdminDataListScreen";
import NewsApiDetailsScreen from "./Screens/NewsApiDetailsScreen";
import CreateEvent from "./Screens/CreateEvent";
import InterestedList from "./Screens/InterestedList";
import { HEADER_LOGO } from "./assets";

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
  const [appState, setAppState] = useState(AppState.currentState);
  const navigationRef = useRef(null);
  
  // Initialize TokenService when app starts
  useEffect(() => {
    // TokenService is automatically initialized when imported
    console.log("TokenService initialized");
    
    // Set up AppState listener to detect when app comes back from background
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Clean up the subscription when component unmounts
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Handle app state changes (background to foreground)
  const handleAppStateChange = async (nextAppState) => {
    // App has come back to the foreground
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come back to the foreground!');
      
      // Check if token exists - if it does, the user will stay logged in
      // If the token doesn't exist (e.g., if the app was killed), the SplashPage
      // will redirect to the login screen
      const isAuthenticated = await tokenService.isAuthenticated();
      console.log('User is authenticated:', isAuthenticated);
    }
    
    setAppState(nextAppState);
  };

  return (
    <Provider store={store}>
      <NavigationContainer
        ref={(ref) => {
          // Set navigation reference for TokenService
          if (ref && navigationRef.current !== ref) {
            navigationRef.current = ref;
            tokenService.setNavigationRef(ref);
          }
        }}
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
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="News Feed" component={NewsFeedScreen} />
          <Stack.Screen name="Author" component={AuthorNameScreen} />
          <Stack.Screen name="Profile" component={ProfilePage} />
          <Stack.Screen name="Saved Articles" component={SavedArticles} />
          <Stack.Screen name="Article Webview" component={ArticleContent} />
          <Stack.Screen name="Shop Now Webview" component={ShopNowWebview} /> 
          <Stack.Screen name="Setting" component={SettingPage} /> 
          <Stack.Screen name="UserList" component={AdminUserList} />
          <Stack.Screen name="AdminDataList" component={AdminDataListScreen} />
          <Stack.Screen name="NewsApiDetails" component={NewsApiDetailsScreen} />
          <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="Create Event" component={CreateEvent} />
          <Stack.Screen name="InterestedList" component={InterestedList} />
          <Stack.Screen name="Shop" component={ShopScreen} />


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
