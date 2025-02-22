import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert, Switch } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import { isValidPassword, isValidEmail } from '../utils/format.mjs';
import VendorProfile from '../components/profile_pages/VendorProfile';
import UserProfile from '../components/profile_pages/UserProfile';
import AdminProfile from '../components/profile_pages/AdminProfile';
import { getAccountType } from '../utils/StorageUtils';

const ACCOUNT_TYPE_ADMIN = "1";
const ACCOUNT_TYPE_VENDOR = "2";
const ACCOUNT_TYPE_USER = "3";

const ProfilePage = ({ navigation }) => {

   const [account_type, setAccountType] = useState('');

   const getData  = async () => { 
    const  account_type = await getAccountType();
    setAccountType(account_type)
  }

  useEffect(()=>{
    getData()
  },[])


    // const account_type = useSelector((store) => store.acct_type.acct_type);

  let content;

    const renderProfile = () => {
        
        if(account_type == ACCOUNT_TYPE_ADMIN)
        return <AdminProfile />;
        else if(account_type == ACCOUNT_TYPE_VENDOR)
        return <VendorProfile />
        else if(account_type == ACCOUNT_TYPE_USER)
        return <UserProfile />
        else return <UserProfile />

        // switch (account_type) {
        //   case ACCOUNT_TYPE_ADMIN == account_type:
        //     console.log('====================================');
        //     console.log('admin---');
        //     console.log('====================================');
        //     return <AdminProfile />;
        //   case ACCOUNT_TYPE_VENDOR == account_type:
        //     return <VendorProfile />;
        //   case ACCOUNT_TYPE_USER == account_type:
        //     return <UserProfile />;
        //   default:
        //     // Alert.alert('Error', 'Invalid account type. Please log in again.', [
        //     //   { text: 'OK', onPress: () => navigation.replace('Log In') },
        //     // ]);
        //     return <View></View>;
        // }
      };

    const [email, setEmail] = useState('');
    //encrypted email
  
    const verifyEmail = async () => {
      try {
        const hashed_email = await hashString(email);
        
        if (!isValidEmail(email)) {
            Alert.alert('Error', "Email format is invalid", [{ text: 'Try Again' }]);
        } else {
            Alert.alert('Valid email!', "not done yet", [{ text: 'Exit' }]);
        }
        
      } catch (error) {
        console.error('Error during sign up:', error.response.data.message);
        Alert.alert('Sign Up Error', error.response.data.message, [{ text: 'Try Again' }]);
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