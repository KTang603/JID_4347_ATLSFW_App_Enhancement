import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { clearAll, getAccountType } from "../utils/StorageUtils";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "./ProfilePage";

const SettingPage = () => {
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);

  const _makeLogout = async () => {
    await clearAll();
    navigation.replace("Log In");
  };

  const udpateDetails = async () => {
    const accountType = await getAccountType();
    setIsAdmin(accountType === ACCOUNT_TYPE_ADMIN);
  };

  useEffect(() => {
    udpateDetails();
  }, []);

  return (
    <View>
      {isAdmin && (
        <>
          <AppPrimaryButton title="Users List" handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "users" })}} />
          <AppPrimaryButton title="Article List" handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "articles" })}} />
          <AppPrimaryButton title="Most Liked" handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "mostLiked" })}} />
          <AppPrimaryButton title="Most Saved" handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "mostSaved" })}} />
          <AppPrimaryButton title="News Api Details" handleSubmit={() => {navigation.navigate("NewsApiDetails")}} />
        </>
      )}
      <AppPrimaryButton
        title="Logout"
        handleSubmit={() => {
          _makeLogout();
        }}
      />
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
