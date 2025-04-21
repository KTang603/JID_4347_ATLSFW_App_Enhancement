import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { getAllParticipants } from "../redux/actions/eventAction";
import { useSelector } from "react-redux";

const InterestedList = (props) => {
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id: userId } = userInfo;
  const navigation = useNavigation();
  const [participant, setParticipants] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getParticipants = async () => {
    const { _id } = props.route.params.event;
    setIsLoading(true);
    const response = await getAllParticipants({
      token: token,
      eventId: _id,
      userId: userId,
    });
    if (response.status == 200) {
      if (response.data.data.length == 0) {
        setIsError(true);
      } else {
        // Filter out any null users before setting state
        const validParticipants = response.data.data.filter(user => user !== null);
        setParticipants(validParticipants);
        setIsError(validParticipants.length === 0); // Show error if no valid participants
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { event_title } = props.route.params.event;
    navigation.setOptions({
      title: event_title,
    });

    getParticipants();
  }, []);

  const InterestedUserCard = ({ user }) => {
    // Safely destructure user properties with default values
    const { 
      first_name = "Unknown", 
      last_name = "User", 
      username, 
      user_email, 
      phone_number 
    } = user;
    
    return (
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          margin: 8,
          padding: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ 
          fontWeight: "bold", 
          fontSize: 18, 
          marginBottom: 10,
          color: "#333"
        }}>
          {first_name + " " + last_name}
        </Text>
        
        <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "center" }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: "500", 
            color: "#666",
            width: 80
          }}>
            Username:
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#333",
            flex: 1
          }}>
            {username || "N/A"}
          </Text>
        </View>
        
        <View style={{ flexDirection: "row", marginBottom: 6, alignItems: "center" }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: "500", 
            color: "#666",
            width: 80
          }}>
            Email:
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#333",
            flex: 1
          }}>
            {user_email || "N/A"}
          </Text>
        </View>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: "500", 
            color: "#666",
            width: 80
          }}>
            Phone:
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#333",
            flex: 1
          }}>
            {phone_number || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {isError ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 20, color: "#666" }}>No Interested Users</Text>
        </View>
      ) : (
        <FlatList
          data={participant}
          renderItem={({ item }) => item ? <InterestedUserCard user={item} /> : null}
          contentContainerStyle={{ padding: 8 }}
          keyExtractor={(item, index) => item && item._id ? item._id.toString() : `user-${index}`}
        />
      )}
      {isLoading && <ActivityIndicator size={'large'} color={'#02833D'} style={{position:'absolute',left:0,right:0,top:0,bottom:0}}/> }
    </View>
  );
};

export default InterestedList;
