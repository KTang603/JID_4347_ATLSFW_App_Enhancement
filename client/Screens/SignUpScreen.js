import React, { useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert, Switch } from 'react-native';
import axios from 'axios';
import hashString from '../utils/hashingUtils.mjs';
import MY_IP_ADDRESS from '../environment_variables.mjs';
import { isValidPassword, isValidEmail, normalizeEmail } from '../utils/format.mjs';
import encryptWithPublicKey from '../utils/encryptionUtils.mjs';
import { setUserInfo } from "../redux/actions/userInfoAction";
import { useSelector, useDispatch } from "react-redux";

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [agreeSubscribe, setAgreeSubscribe] = useState(false);
  const [user_id, setUserID] = useState("");

  // REDUX
  //send login action to store
  const dispatch = useDispatch();

  //encrypted email

  const handleSignUp = async () => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const hashed_email = await hashString(normalizedEmail);
      const hashed_password = await hashString(password);
      const encrypted_email = encryptWithPublicKey(normalizedEmail);

      if (!isValidEmail(email)) {
        Alert.alert("Error", "Email format is invalid", [
          { text: "Try Again" },
        ]);
      } else if (!isValidPassword(password)) {
        Alert.alert(
          "Error",
          "Password must satisfy the following requirements: \n1. At least one uppercase letter \n2. At least one lowercase letter \n3. At least one number \n4. At least one special character \n 5. At least 8 characters long",
          [{ text: "Try Again" }]
        );
      } else {
        // Send the user data to your backend
        let userData = {
          hashed_email: hashed_email,
          hashed_password: hashed_password,
          encrypted_email: encrypted_email,
          first_name: firstName,
          last_name: lastName,
          username: username,
          gender: gender,
          phone_number: phoneNum,
          subscribed_to_news: agreeSubscribe,
          birthday: birthday,
        };

        const response = await axios.post(
          "http://" + MY_IP_ADDRESS + ":5050/signup",
          userData
        );

        const data = response.data;
        if (data.success) {
            const updatedUserInfo = {
              ...userData,
              user_id: data.user._id, // Assuming the server response structure includes user._id
            };
          dispatch(setUserInfo(updatedUserInfo));
          Alert.alert("Success", "Account created successfully!", [
            { text: "OK" },
          ]);
          navigation.reset({ index: 0, routes: [{ name: 'Log In' }], });
        } else {
          Alert.alert("Error", data.message, [{ text: "Try Again" }]);
        }
      }
    } catch (error) {
      console.error("Error during sign up:", error.response?.data?.message);
      Alert.alert("Sign Up Error", error.response?.data?.message, [
        { text: "Try Again" },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create an Account</Text>

      <TextInput
        placeholder="First Name*"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name*"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Username*"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Email*"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password*"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNum}
        onChangeText={setPhoneNum}
        style={styles.input}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Birthday (yyyy-mm-dd)"
        value={birthday}
        onChangeText={setBirthday}
        style={styles.input}
      />
      <TextInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
        style={styles.input}
      />
      <View style={styles.switchContainer}>
        <Text>Subscribe to our newsletter? </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={agreeSubscribe ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() =>
            setAgreeSubscribe((previousState) => !previousState)
          }
          value={agreeSubscribe}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" color="black" onPress={handleSignUp} />
      </View>

      <Text style={styles.text}>Already have an account?</Text>
      <View>
        <Button
          title="Log in here!"
          color="green"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Log In' }], })}
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
  buttonContainer: {
    marginVertical: 6,
    backgroundColor: 'lightgray',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
    paddingTop: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    padding: 8,
  },
});

export default SignUpScreen;
