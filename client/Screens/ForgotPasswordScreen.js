import React, { useState } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import axios from "axios";
import hashString from "../utils/hashingUtils.mjs";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import AppPrimaryButton from "../components/AppPrimaryButton";
import BaseIndicator from "../components/BaseIndicator";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password

  const sendEmailRequest = async () => {
    try {
      if (!email || email.trim().length == 0) {
        Alert.alert("Error", "Please enter your email address");
        return;
      }
      setIsLoading(true);
      const hashed_email = await hashString(email);
      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/password/forgot-password`,
        {
          hashed_email,
        }
      );
      setIsLoading(false);

      if (response.data.success) {
        setStep(2);
      } else {
        Alert.alert("Error", response?.data?.message);
      }
    } catch (error) {
      setIsLoading(false);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send verification code"
      );
    }
  };

  const sendResetPassword = async () => {
    Keyboard.dismiss();
    try {
      if (!newPassword || !newPassword.trim()) {
        Alert.alert("Error", "Please enter new password");
        return;
      } else if (!confirmNewPassword || !confirmNewPassword.trim()) {
        Alert.alert("Error", "Please enter confirm password");
        return;
      } else if (newPassword.trim() != confirmNewPassword.trim()) {
        Alert.alert("Error", "Password missmatch");
        return;
      }

      const hashed_email = await hashString(email);
      const hashed_password = await hashString(confirmNewPassword);
      setIsLoading(true);
      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/password/reset-password`,
        {
          hashed_email,
          hashed_password,
        }
      );
      setIsLoading(false);
      if (response.data.success) {
        setConfirmNewPassword('');
        setNewPassword('');
        setEmail('');
        Alert.alert("Success", response?.data?.message);
      } else {
        Alert.alert("Error", response?.data?.message);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send verification code"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password ?</Text>

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
          <AppPrimaryButton
            title="Submit"
            handleSubmit={() => {
              sendEmailRequest();
            }}
          />
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            secureTextEntry={true}
          />

          <TextInput
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            style={styles.input}
            secureTextEntry={true}
          />
          <AppPrimaryButton
            title="Submit"
            handleSubmit={() => {
              sendResetPassword();
            }}
          />
        </>
      )}

      {isLoading && <BaseIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 60,
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
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
    backgroundColor: "lightgray",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 20,
  },
  backButtonContainer: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
