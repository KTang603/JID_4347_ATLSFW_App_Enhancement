import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";

const EventsScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState({});
  const navigation = useNavigation();

  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const isAdmin = userInfo?.user_roles == ACCOUNT_TYPE_ADMIN;

  // Separate marking for selected date (bold) and events (green dot)
  const markedDates = {
    ...events, // Dates with events get green dots
    [selectedDate]: {
      // Only make the selected date bold, no color change
      selected: true,
      selectedTextColor: "green",
      selectedColor: "transparent",
      textStyle: {
        fontWeight: "bold",
        color: "green",
      },
    },
  };

  const EventCard = ({ user }) => {
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
          {"Event Name................"}
        </Text>
        <Text>{"Noida, Uttar Pradesh"}</Text>
        <Text>
          {
            "Forget your Kal ki Chinta and Join us in this super funny Show by Ravi Gupta. Kal Ki Chinta Nahi Karta is new stand up special by Ravi Gupta."
          }
        </Text>
        <TouchableOpacity>
          <Text style={{ textDecorationLine: "underline", color: "blue" }}>
            {"Event Link"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const eventData = [{}, {}, {}, {}, {}];

  return (
    <ScrollView>
      <View style={styles.container}>
        <Calendar
          style={{
            width: "100%",
            transform: [{ scale: 0.95 }], // This scales both width and height uniformly
          }}
          onDayPress={(day) => {
            console.log("selected day", day);
          }}
          markedDates={{
            "2025-03-09": { selected: true, selectedColor: "green" },
            "2025-03-08": { selected: true, selectedColor: "green" },
            "2025-03-07": { selected: true, selectedColor: "green" },
            "2025-03-06": { selected: true, selectedColor: "green" },
          }}
          // onDayPress={day => {
          //   setSelectedDate(day.dateString);
          // }}
          theme={{
            textDayFontWeight: "normal", // Normal weight for unselected dates
            textDayFontSize: 16,
            dotColor: "green", // Color for event dots
            todayTextColor: "#000000", // Keep today's date black
          }}
        />

        {/* Add Event Button (Admin Only) */}
        {isAdmin && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={{ width: "90%", alignItems: "center" }}>
              <AppPrimaryButton title={"Add Event"} handleSubmit={() => {navigation.navigate('CreateEvent')}} />
              {eventData.map((item) => {
                return <EventCard user={item} />;
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  addEventButton: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 20,
    minWidth: 75,
  },
  addEventButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
  eventContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  eventLocation: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
});

export default EventsScreen;
