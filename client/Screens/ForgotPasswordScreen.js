import React, { useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import MY_IP_ADDRESS from '../environment_variables.mjs';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password

  const handleSendCode = async () => {
    try {
      const hashed_email = await hashString(email);
      const response = await axios.post(`http://${MY_IP_ADDRESS}:5050/password/forgot-password`, {
        hashed_email,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Verification code sent! For testing, check the server console output.');
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const hashed_email = await hashString(email);
      const response = await axios.post(`http://${MY_IP_ADDRESS}:5050/password/verify-code`, {
        hashed_email,
        code,
      });

      if (response.data.success) {
        setStep(3);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleResetPassword = async () => {
    try {
      const hashed_email = await hashString(email);
      const hashed_password = await hashString(newPassword);
      const response = await axios.post(`http://${MY_IP_ADDRESS}:5050/password/reset-password`, {
        hashed_email,
        code,
        hashed_password,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password reset successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Log In') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      
      {step === 1 && (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Send Verification Code"
              color="black"
              onPress={handleSendCode}
            />
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="Enter Verification Code"
            value={code}
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Verify Code"
              color="black"
              onPress={handleVerifyCode}
            />
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            placeholder="Enter New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Reset Password"
              color="black"
              onPress={handleResetPassword}
            />
          </View>
        </>
      )}

      <View style={styles.backButtonContainer}>
        <Button
          title="Back to Login"
          color="green"
          onPress={() => navigation.navigate('Log In')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
  },
  buttonContainer: {
    marginRight: 90,
    marginLeft: 90,
    marginTop: 0,
    paddingTop: 1,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 20,
  },
  backButtonContainer: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
