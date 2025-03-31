import React from "react";
import { View, StyleSheet } from "react-native";

const ProfileHeader = () => {
  return (
    <View style={styles.header}>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#02833D", // A green color similar to the one in the image.
    padding: 50,
    alignItems: "center",
  },
});

export default ProfileHeader;
