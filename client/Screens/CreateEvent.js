import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AppPrimaryButton from "../components/AppPrimaryButton";

const CreateEvent = () => {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Text style={styles.label}>Event Name:</Text>
      <TextInput
        value={""}
        // onChangeText={setEditedFirstName}
        style={styles.input}
      />

      <Text style={styles.label}>Event Location:</Text>
      <TextInput
        value={""}
        // onChangeText={setEditedFirstName}
        style={styles.input}
      />
      <Text style={styles.label}>Event Date:</Text>
      <TextInput
        value={""}
        // onChangeText={setEditedFirstName}
        style={styles.input}
      />

      <Text style={styles.label}>Event Description:</Text>
      <TextInput
        value={""}
        // onChangeText={setEditedFirstName}
        style={styles.input}
      />
      <Text style={styles.label}>Event Link:</Text>
      <TextInput
        value={""}
        // onChangeText={setEditedFirstName}
        style={styles.input}
      />

      <AppPrimaryButton title={"Add Event"} handleSubmit={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 15,
    color: "#424242",
    paddingVertical: 5,
  },
});

export default CreateEvent;
