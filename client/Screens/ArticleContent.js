import React, { useRef, useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getAuthToken } from '../utils/TokenUtils';
import { setToken } from '../redux/actions/tokenAction';

const ArticleContent = ({ route, navigation }) => {
  const webViewRef = useRef(null);
  const { link } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  
  const dispatch = useDispatch();
  const reduxToken = useSelector((store) => store.token?.token);
  
  // If you need to make API requests in this component, add this function
  const ensureAuthentication = async () => {
    try {
      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If token exists but isn't in Redux, update Redux
      if (!reduxToken && token) {
        dispatch(setToken(token));
      }
      
      return token;
    } catch (error) {
      console.error('Error ensuring authentication:', error);
      return null;
    }
  };
  
  // Example of how you might use this for a feature like tracking article views
  useEffect(() => {
    const trackArticleView = async () => {
      const token = await ensureAuthentication();
      if (token) {
        // Make API request to track article view
        // ...
      }
    };
    
    trackArticleView();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <ActivityIndicator 
          style={styles.loader} 
          size="large" 
          color="#02833D" 
        />
      )}
      
      <WebView 
        source={{ uri: link }}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
});

export default ArticleContent;