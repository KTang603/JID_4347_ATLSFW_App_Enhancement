import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { clearAll, getAccountType } from "../utils/StorageUtils";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "./ProfilePage";

/**
 * Settings Page Component
 * Displays different navigation options based on user's account type
 * Admin users see additional management options
 */
const SettingPage = () => {
  const navigation = useNavigation();
  // Track if current user has admin privileges
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Handles user logout
   * Clears all stored data and redirects to login screen
   */
  const handleLogout = async () => {
    await clearAll();
    navigation.reset({
      index: 0,
      routes: [{ name: "Log In" }],
    });
  };

  /**
   * Helper function to navigate to admin list screens
   * @param {string} listType - Type of list to display
   */
  const navigateToAdminList = (listType) => {
    navigation.navigate("AdminDataList", { listType });
  };

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      const accountType = await getAccountType();
      setIsAdmin(accountType === ACCOUNT_TYPE_ADMIN);
    };
    
    checkAdminStatus();
  }, []);

  // Define admin options as data structure for easier maintenance
  const adminOptions = [
    { title: "Users List", listType: "users" },
    { title: "Vendor List", listType: "vendors" },
    { title: "Admin Article List", listType: "articles" },
    { title: "Top 10 Most Liked", listType: "mostLiked" },
    { title: "Top 10 Most Saved", listType: "mostSaved" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Conditionally render admin options */}
        {isAdmin && (
          <>
            {/* Map through admin options to create buttons */}
            {adminOptions.map((option, index) => (
              <AppPrimaryButton
                key={index}
                title={option.title}
                containerStyle={styles.buttonStyle}
                handleSubmit={() => navigateToAdminList(option.listType)}
              />
            ))}
            {/* Special case for News API config that uses different navigation */}
            <AppPrimaryButton
              title="News Api Config"
              containerStyle={styles.buttonStyle}
              handleSubmit={() => navigation.navigate("NewsApiDetails")}
            />
          </>
        )}
        {/* Logout button available to all users */}
        <AppPrimaryButton
          title="Logout"
          containerStyle={styles.buttonStyle}
          handleSubmit={handleLogout}
        />
      </View>
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Light background for the entire screen
  },
  buttonContainer: {
    padding: 16,
    alignItems: "center", // Center-align all buttons
  },
  buttonStyle: {
    backgroundColor: "lightgray",
    borderRadius: 3,
    width: "80%", // Consistent width for all buttons
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15, // Vertical spacing between buttons
    paddingVertical: 12, // Button height through padding
  },
});

export default SettingPage;