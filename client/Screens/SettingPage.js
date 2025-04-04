import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View, ScrollView } from "react-native";
import { useNavigation} from "@react-navigation/native";
import { clearAll, getAccountType } from "../utils/StorageUtils";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "./ProfilePage";


const SettingPage = () => {
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);

  const _makeLogout = async () => {
    await clearAll();
    navigation.reset({
      index: 0,
      routes: [{ name: "Log In" }],
    })
  };

  const udpateDetails = async () => {
    const accountType = await getAccountType();
    setIsAdmin(accountType === ACCOUNT_TYPE_ADMIN);
  };

  useEffect(() => {
    udpateDetails();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        {isAdmin && (
          <>
            <AppPrimaryButton 
              title="Users List" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "users" })}} 
            />
            <AppPrimaryButton 
              title="Vendor List" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "vendors" })}} 
            />
            <AppPrimaryButton 
              title="Admin Article List" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "articles" })}} 
            />
            <AppPrimaryButton 
              title="Top 10 Most Liked" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "mostLiked" })}} 
            />
            <AppPrimaryButton 
              title="Top 10 Most Saved" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("AdminDataList", { listType: "mostSaved" })}} 
            />
            <AppPrimaryButton 
              title="News Api Config" 
              containerStyle={styles.buttonStyle}
              handleSubmit={() => {navigation.navigate("NewsApiDetails")}} 
            />
          </>
        )}
        <AppPrimaryButton
          title="Logout"
          containerStyle={styles.buttonStyle}
          handleSubmit={() => {
            _makeLogout();
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    padding: 16,
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: "lightgray",
    borderRadius: 3,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 12,
  },
  updateButtonTextStyle: {
    fontSize: 18,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
});

export default SettingPage;
