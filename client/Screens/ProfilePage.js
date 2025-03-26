import React, { useEffect, useState } from "react";
import {
  Button,
  Text,
  TextInput,
  View,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import hashString from "../utils/hashingUtils.mjs";
import { isValidPassword, isValidEmail } from "../utils/format.mjs";
import VendorProfile from "../components/profile_pages/VendorProfile";
import UserProfile from "../components/profile_pages/UserProfile";
import AdminProfile from "../components/profile_pages/AdminProfile";
import { getAccountType } from "../utils/StorageUtils";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

export const ACCOUNT_TYPE_ADMIN = "3";
const ACCOUNT_TYPE_VENDOR = "2";
const ACCOUNT_TYPE_USER = "1";

const ProfilePage = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [account_type, setAccountType] = useState("");

  const getData = async () => {
    const account_type = await getAccountType();
    setAccountType(account_type);
  };

  useEffect(() => {
    getData();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return renderProfile();
      case "Settings":
        return (
          <ScrollView style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate("SettingPage")}
            >
              <View style={styles.settingItemContent}>
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color="#333"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingText}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>

            {account_type == ACCOUNT_TYPE_ADMIN && (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() =>
                  navigation.navigate("AdminDataList", { listType: "users" })
                }
              >
                <View style={styles.settingItemContent}>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color="#333"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingText}>Manage Users</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            )}
          </ScrollView>
        );
      default:
        return renderProfile();
    }
  };

  const renderProfile = () => {
    if (account_type == ACCOUNT_TYPE_ADMIN) return <AdminProfile />;
    else if (account_type == ACCOUNT_TYPE_VENDOR) return <VendorProfile />;
    else if (account_type == ACCOUNT_TYPE_USER) return <UserProfile />;
    else return <UserProfile />;
  };

  return <View style={styles.container}>{renderTabContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#007AFF",
  },
  settingsContainer: {
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
    marginBottom: 16,
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
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 50,
//   },
//   buttonContainer: {
//     borderColor: 'black',
//     marginVertical: 12,
//     borderWidth: 1,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//   },
//   switchContainer: {
//     marginVertical: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   text: {
//     fontWeight: 'bold',
//     fontSize: 18,
//     paddingTop: 20,
//     paddingBottom: 22,
//     textAlign: 'center',
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 12,
//     padding: 8,
//   },
// });

export default ProfilePage;
