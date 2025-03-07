import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { clearAll } from "../utils/StorageUtils";

const SettingPage = () => {
  const navigation = useNavigation();
  const _makeLogout = async () => {
    await clearAll();
    navigation.replace("Log In");
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.updateButtonStyle}
        onPress={(view) => {
          _makeLogout();
        }}
      >
        <Text style={styles.updateButtonTextStyle}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  updateButtonStyle: {
    backgroundColor: "lightgray",
    borderRadius: 3,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 12,
  },
  updateButtonTextStyle: {
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
});

export default SettingPage;
