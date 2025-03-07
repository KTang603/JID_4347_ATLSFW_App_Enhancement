import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert, Switch } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import { isValidPassword, isValidEmail } from '../utils/format.mjs';
import VendorProfile from '../components/profile_pages/VendorProfile';
import UserProfile from '../components/profile_pages/UserProfile';
import AdminProfile from '../components/profile_pages/AdminProfile';
import { getAccountType } from '../utils/StorageUtils';
import { useDispatch } from 'react-redux';

const ACCOUNT_TYPE_ADMIN = "3";
const ACCOUNT_TYPE_VENDOR = "2";
const ACCOUNT_TYPE_USER = "1";

const ProfilePage = ({ navigation }) => {
   const [account_type, setAccountType] = useState('');

   const getData  = async () => { 
    const account_type = await getAccountType();
    setAccountType(account_type)

  }

  useEffect(()=>{
    getData()
  },[])

    const renderProfile = () => {
      // console.log('account_type-----',account_type);
        if(account_type == ACCOUNT_TYPE_ADMIN)
        return <AdminProfile />;
        else if(account_type == ACCOUNT_TYPE_VENDOR)
        return <VendorProfile />
        else if(account_type == ACCOUNT_TYPE_USER)
        return <UserProfile />
        else return <UserProfile />
      };

  
    return (
      <View style={{ flex: 1 }}>
        {renderProfile()}
      </View>
    );
  };


  
  // const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     padding: 50,
  //   },
  //   buttonContainer: {
  //     borderColor: 'black',
  //     marginVertical: 12,
  //     borderWidth: 1,
  //     backgroundColor: '#f0f0f0',
  //     borderRadius: 10,
  //   },
  //   switchContainer: {
  //     marginVertical: 10,
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //   },
  //   text: {
  //     fontWeight: 'bold',
  //     fontSize: 18,
  //     paddingTop: 20,
  //     paddingBottom: 22,
  //     textAlign: 'center',
  //   },
  //   input: {
  //     height: 40,
  //     borderColor: '#ccc',
  //     borderWidth: 1,
  //     borderRadius: 8,
  //     marginBottom: 12,
  //     padding: 8,
  //   },
  // });
  
  export default ProfilePage;