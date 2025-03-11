import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import VendorProfile from '../components/profile_pages/VendorProfile';
import UserProfile from '../components/profile_pages/UserProfile';
import AdminProfile from '../components/profile_pages/AdminProfile';
import { getAccountType, getUserToken } from '../utils/StorageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthToken } from '../utils/TokenUtils';
import { setToken } from '../redux/actions/tokenAction';

export const ACCOUNT_TYPE_ADMIN = "3";
const ACCOUNT_TYPE_VENDOR = "2";
const ACCOUNT_TYPE_USER = "1";

const ProfilePage = ({ navigation }) => {
  const [account_type, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const reduxToken = useSelector((store) => store.token?.token);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If no token is available, navigate to login
      if (!token) {
        console.log('No authentication token available');
        setIsLoading(false);
        
        Alert.alert(
          "Authentication Required",
          "Please log in to view your profile",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Log In')
            }
          ]
        );
        return;
      }
      
      // If token exists but isn't in Redux, update Redux
      if (!reduxToken && token) {
        dispatch(setToken(token));
      }
      
      // Get account type
      const accountType = await getAccountType();
      setAccountType(accountType);
      
      // If you need to fetch profile data from API, do it here
      // const profileData = await fetchProfileData(token);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError('Failed to load profile data. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const renderProfile = () => {
    if (account_type == ACCOUNT_TYPE_ADMIN)
      return <AdminProfile />;
    else if (account_type == ACCOUNT_TYPE_VENDOR)
      return <VendorProfile />;
    else if (account_type == ACCOUNT_TYPE_USER)
      return <UserProfile />;
    else 
      return <UserProfile />;
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#02833D" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadProfileData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderProfile()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#02833D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfilePage;