import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, Platform, Image, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import { normalizeEmail } from '../utils/format.mjs';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../redux/actions/loginAction';
import { setID } from '../redux/actions/idAction';
import { get_like_list } from '../redux/actions/likeAction';
import { get_save_list } from '../redux/actions/saveAction';
import { set_acct_type } from '../redux/actions/accountAction';
import { setUserInfo, updateUserToken } from '../redux/actions/userInfoAction';
import { getVend } from '../redux/actions/vendAction';
import { setToken } from '../redux/actions/tokenAction';
import {LOGIN_API} from '../utils/ApiUtils.js'
import {fetchData, fetchTags} from '../redux/actions/NewsAction'
import { storeAccountType, storeUserId, storeUserToken } from '../utils/StorageUtils';
import { HEADER_LOGO, LOGIN_LOGO } from '../assets';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState(__DEV__?'vivekadmin1@gmail.com':'');
  const [password, setPassword] = useState(__DEV__?'Vivek@12345':'');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const user_id = useSelector((store) => store.user_id.user_id);
  const account_type = useSelector((store) => store.acct_type.acct_type);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const hashed_email = await hashString(normalizedEmail);
      const hashed_password = await hashString(password);

      const response = await axios({
        method: 'post',
        url: LOGIN_API,
        data: {
          hashed_email,
          hashed_password,
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      const data = response.data;
      // console.log('data----'+JSON.stringify(data));
      if (data.success) {
          dispatch(login());
          dispatch(setID(data.user._id));
          dispatch(setUserInfo(data.user));
          // dispatch(getVend(data.user.vendor_account_initialized));
          // Set token in Redux and axios defaults
          const token = data.token;
          dispatch(updateUserToken(token)) 
          dispatch(fetchTags(token))        
          storeUserId(""+data.user._id)
          storeAccountType(""+data.user.user_roles)
          storeUserToken(token)
          await dispatch(fetchData(1, [],token));
          dispatch(setToken(token));
          dispatch(set_acct_type(data.user.user_roles));

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token set after login:', token);

          // if (data.user.liked_articles != null) {
          //   dispatch(get_like_list(data.user.liked_articles));
          // }
          // if (data.user.saved_articles != null) {
          //   dispatch(get_save_list(data.user.saved_articles));
          // }

          navigation.reset({
            index: 0,
            routes: [{ name: 'News Feed' }],
          });
      } else {
        Alert.alert('Login Error', data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error?.response?.data?.message || error.message);
      Alert.alert('Login Error', error?.response?.data?.message || 'Failed to connect to server. Please try again.',
        [{text:'Try Again', cancelable: true}]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{flex:1,backgroundColor: "#fff" }}>

      <View style={styles.container}>
        <Image
          resizeMode='contain'
          source={LOGIN_LOGO}
          style={styles.logo}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
            
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
            
        <View style={{ width: "75%", alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Forgot Password")}
          >
            <Text style={styles.buttonText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
         onPress={() => navigation.navigate('Sign Up')}
         style={styles.signUpSection}>
          <Text style={styles.newHereText}>
            Don't have an account?
            <Text style={{ fontWeight: "bold" }}> Sign up</Text>
          </Text>
  
        </TouchableOpacity>
      </View>
     
     {isLoading && <ActivityIndicator style={{position:'absolute',left:0,right:0,top:0,bottom:0}} size="large" color="#0000ff" /> }

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 280,
    height: 200,
    marginTop: 25,
    resizeMode: 'contain',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '75%',
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: 'lightgray',
    borderRadius: 3,
    width: '75%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop:15,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 3,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  signUpSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  newHereText: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
});

export default LoginScreen;
