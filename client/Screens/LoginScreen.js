import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity, Platform, Image } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import MY_IP_ADDRESS from '../environment_variables.mjs';
import { normalizeEmail } from '../utils/format.mjs';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../redux/actions/loginAction';
import { setID } from '../redux/actions/idAction';
import { get_like_list } from '../redux/actions/likeAction';
import { get_save_list } from '../redux/actions/saveAction';
import { set_acct_type } from '../redux/actions/accountAction';
import { setUserInfo } from '../redux/actions/userInfoAction';
import { getVend } from '../redux/actions/vendAction';
import { setToken } from '../redux/actions/tokenAction';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        url: `http://${MY_IP_ADDRESS}:5050/login`,
        data: {
          hashed_email,
          hashed_password,
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
      const data = response.data;

      if (data.success) {
          dispatch(login());
          dispatch(setID(data.user._id));
          dispatch(setUserInfo(data.user));
          dispatch(getVend(data.user.vendor_account_initialized));
          // Set token in Redux and axios defaults
          const token = data.token;
          dispatch(setToken(token));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token set after login:', token);

          if (data.user.liked_articles != null) {
            dispatch(get_like_list(data.user.liked_articles));
          }
          if (data.user.saved_articles != null) {
            dispatch(get_save_list(data.user.saved_articles));
          }

          dispatch(set_acct_type(data.account_type));
          navigation.reset({
            index: 0,
            routes: [{ name: 'Community' }],
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
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../components/ATLSFWlogo.jpg")}
          style={styles.logo}
        />
      </View>

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
      
      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: 'lightgray' }]}
        onPress={() => navigation.navigate('Forgot Password')}
      >
        <Text style={styles.buttonText}>FORGOT PASSWORD?</Text>
      </TouchableOpacity>

      <View style={styles.signUpSection}>
        <Text style={styles.newHereText}>NEW HERE?</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'lightgray', marginBottom: 0, marginLeft: 10 }]}
          onPress={() => navigation.navigate('Sign Up')}
        >
          <Text style={styles.buttonText}>SIGN UP HERE!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
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
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
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
  signUpSection: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newHereText: {
    fontSize: 16,
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
