import React from "react";
import { View, Text, TouchableOpacity, Image,StyleSheet } from "react-native";
import { SETTING_ICON } from "../assets";
import { useNavigation } from "@react-navigation/native";

const ProfileHeader = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Setting")}
        style={{ position: "absolute", right: 20, top: 10 }}
      >
        <Image source={SETTING_ICON} style={{ height: 30, width: 30 }} />
      </TouchableOpacity>
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
