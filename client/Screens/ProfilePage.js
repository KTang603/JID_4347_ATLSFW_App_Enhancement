import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import VendorProfile from '../components/profile_pages/VendorProfile';
import UserProfile from '../components/profile_pages/UserProfile';
import AdminProfile from '../components/profile_pages/AdminProfile';

const ACCOUNT_TYPE_ADMIN = 1;
const ACCOUNT_TYPE_VENDOR = 2;
const ACCOUNT_TYPE_USER = 3;

const ProfilePage = ({ navigation }) => {
  const account_type = useSelector((store) => store.acct_type.acct_type);

  const renderProfile = () => {
    switch (account_type) {
      case ACCOUNT_TYPE_ADMIN:
        return <AdminProfile />;
      case ACCOUNT_TYPE_VENDOR:
        return <VendorProfile />;
      case ACCOUNT_TYPE_USER:
        return <UserProfile />;
      default:
        Alert.alert('Error', 'Invalid account type. Please log in again.', [
          { text: 'OK', onPress: () => navigation.replace('Log In') },
        ]);
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderProfile()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 50,
  },
  buttonContainer: {
    borderColor: 'black',
    marginVertical: 12,
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  switchContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 20,
    paddingBottom: 22,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
  },
});

export default ProfilePage;
