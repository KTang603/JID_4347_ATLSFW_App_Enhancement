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
        setParticipants(response.data.data);
        setIsError(false);
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
    const { first_name, last_name, gender, phone_number, birthday } = user;
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
          {first_name + " " + last_name}
        </Text>
        <Text>{phone_number}</Text>
        <Text>{"Gender : " + gender}</Text>
        <Text>{"Birthday : " + birthday + ""}</Text>
      </View>
    );
  };

  return (
    <>
      {isError ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 20 }}>No Interested Users</Text>
        </View>
      ) : (
        <FlatList
          data={participant}
          renderItem={({ item }) => <InterestedUserCard user={item} />}
        />
      )}
      {isLoading && <ActivityIndicator size={'large'} color={'#02833D'} style={{position:'absolute',left:0,right:0,top:0,bottom:0}}/> }
    </>
  );
};

export default InterestedList;
