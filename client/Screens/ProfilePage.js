import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput, Button } from 'react-native';
import { useSelector } from 'react-redux';
import VendorProfile from '../components/profile_pages/VendorProfile';
import UserProfile from '../components/profile_pages/UserProfile';
import AdminProfile from '../components/profile_pages/AdminProfile';
import hashString from '../utils/hashingUtils.mjs';
import { isValidEmail } from '../utils/format.mjs';

const ACCOUNT_TYPE_ADMIN = 1;
const ACCOUNT_TYPE_VENDOR = 2;
const ACCOUNT_TYPE_USER = 3;

const ProfilePage = ({ navigation }) => {
  const account_type = useSelector((store) => store.acct_type.acct_type);
  const [email, setEmail] = useState('');

  const verifyEmail = async () => {
    try {
      const hashed_email = await hashString(email);

      if (!isValidEmail(email)) {
        Alert.alert('Error', 'Email format is invalid', [{ text: 'Try Again' }]);
      } else {
        Alert.alert('Valid email!', 'Email verification is successful.', [{ text: 'Exit' }]);
        // You can add additional logic here, such as sending the hashed email to a server.
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      Alert.alert(
        'Verification Error',
        error.response?.data?.message || 'An error occurred during email verification.',
        [{ text: 'Try Again' }]
      );
    }
  };

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
      {/* Email verification section */}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Verify Email" onPress={verifyEmail} />
      </View>

      {/* Render profile based on account type */}
      {renderProfile()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
