import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import hashString from "../utils/hashingUtils.mjs";
import {
  isValidPassword,
  isValidEmail,
  normalizeEmail,
} from "../utils/format.mjs";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { makeSignup } from "../redux/actions/loginAction";

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");


  const handleSignUp = async () => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const hashed_email = await hashString(normalizedEmail);
      const hashed_password = await hashString(password);


      if(firstName.trim().length == 0){
        Alert.alert("Error","First Name cannot be empty")
      } else if(lastName.trim().length == 0){
        Alert.alert("Error","Last Name cannot be empty")
      } else if(username.trim().length == 0){
        Alert.alert("Error","Username cannot be empty")
      } else if(email.trim().length == 0){
        Alert.alert("Error","Email cannot be empty")
      } else if (!isValidEmail(email)) {
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
          first_name: firstName,
          last_name: lastName,
          username: username,
          gender: gender,
          phone_number: phoneNum,
          birthday: birthday,
          user_email:email,
        };

        const response = await makeSignup(userData)
        if (response.success) {
          Alert.alert("Success", "Account created successfully!", [
            { text: "OK" },
          ]);
          setFirstName('');
          setLastName('');
          setUsername('');
          setEmail('');
          setPassword('');
          setPhoneNum('');
          setBirthday('');
          setGender('');
        } else {
          Alert.alert("Error", data.message, [{ text: "Try Again" }]);
        }
      }
    } catch (error) {
      Alert.alert("Sign Up Error", error.response?.data?.message || "An error occurred during sign up", [
        { text: "Try Again" },
      ]);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.text}>Let's Get start!</Text>
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
          placeholder="Phone Number (Optional)"
          value={phoneNum}
          onChangeText={setPhoneNum}
          style={styles.input}
          keyboardType="number-pad"
        />
        <TextInput
          placeholder="Birthday (yyyy-mm-dd) (Optional)"
          value={birthday}
          keyboardType="default"
          onChangeText={setBirthday}
          style={styles.input}
        />
        <TextInput
          placeholder="Gender (Optional)"
          value={gender}
          keyboardType="default"
          onChangeText={setGender}
          style={styles.input}
        />
        <AppPrimaryButton title={"Sign Up"} handleSubmit={handleSignUp} />

        <TouchableOpacity
          onPress={() => navigation.navigate("Log In")}
          style={styles.signUpSection}
        >
          <Text style={styles.newHereText}>
            Already have an account? {""}
            <Text style={{ fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 6,
    backgroundColor: "lightgray",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
  },
  signUpSection: {
    marginTop: 14,
    alignItems: "center",
  },
  newHereText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 25,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    marginTop: 5,
    paddingHorizontal: 10,
  },
});

export default SignUpScreen;
