import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getAccountType } from "../utils/StorageUtils";
import Icon from "react-native-vector-icons/FontAwesome";
import VendorProfile from "../components/profile_pages/VendorProfile";
import UserProfile from "../components/profile_pages/UserProfile";
import AdminProfile from "../components/profile_pages/AdminProfile";

// Constants for account types
export const ACCOUNT_TYPE_ADMIN = "3";
const ACCOUNT_TYPE_VENDOR = "2";
const ACCOUNT_TYPE_USER = "1";

const ProfilePage = ({ navigation }) => {
  const [accountType, setAccountType] = useState("");

  // Fetch account type on component mount
  useEffect(() => {
    const fetchAccountType = async () => {
      const type = await getAccountType();
      setAccountType(type);
    };
    
    fetchAccountType();
    
    // Set the header right button for settings
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Setting")}
          style={{ marginRight: 10 }}
        >
          <Icon name="gear" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Render appropriate profile based on account type
  const renderProfile = () => {
    switch (accountType) {
      case ACCOUNT_TYPE_ADMIN:
        return <AdminProfile />;
      case ACCOUNT_TYPE_VENDOR:
        return <VendorProfile />;
      case ACCOUNT_TYPE_USER:
      default:
        return <UserProfile />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {renderProfile()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ProfilePage;