import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

const AdminUserList = () => {
    const navigation = useNavigation();
  const [users, setUsers] = useState([
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ]);
  useEffect(()=>{
    navigation.setOptions({
        title:'Users List'
    })
  },[])

  const UserCard = ({ user }) => {
    return (
      <View
        style={{
          borderBottomColor: "gray",
          borderBottomWidth: 1,
          margin: 5,
          padding: 5,
        }}
      >
        <Text style={{ fontStyle: "normal", fontWeight: "bold", fontSize: 15 }}>
          {"Vivek Users"}
        </Text>
        <Text>{"abc@gmail.com"}</Text>
        <Text>{"+91 9876543210"}</Text>
      </View>
    );
  };

  return <FlatList
        data={users}
        renderItem={({ item }) => <UserCard user={item} />}
      />;
};

export default AdminUserList;
