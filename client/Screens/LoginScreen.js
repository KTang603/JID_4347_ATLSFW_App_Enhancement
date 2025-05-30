import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import { normalizeEmail } from '../utils/format.mjs';
import { useDispatch } from 'react-redux';
import { setUserInfo, updateUserToken } from '../redux/actions/userInfoAction';
import {LOGIN_API} from '../utils/ApiUtils.js'
import {fetchData, fetchTags} from '../redux/actions/NewsAction'
import tokenService from '../utils/TokenService';
import { LOGIN_LOGO } from '../assets';
import { fetchHomeData } from '../redux/actions/homeAction';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    // Clear any existing tokens before login attempt
    try {
      await tokenService.clearAll();
    } catch (tokenError) {
      // Continue with login even if token clearing fails
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
      if (data.success) {
          dispatch(setUserInfo(data.user));
          
          // Set token in Redux and store auth data
          const token = data.token;
          dispatch(updateUserToken(token)) 
          dispatch(fetchTags(token))
          
          // Store all auth data at once using TokenService
          await tokenService.setAuthData({
            token: token,
            userId: ""+data.user._id,
            accountType: ""+data.user.user_roles
          });
          dispatch(fetchHomeData(token));
          await dispatch(fetchData(1, [],token));

          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
      } else {
        Alert.alert('Login Error', data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
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

        <View style={{ width: "75%", alignItems: "center", marginTop: 10 }}>
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
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  signUpSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  newHereText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
});

export default LoginScreen;
