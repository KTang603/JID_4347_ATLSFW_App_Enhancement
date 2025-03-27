import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
  addParticipantRequest,
  getAllEvent,
} from "../redux/actions/eventAction";

const EventsScreen = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState([]);
  const [oldEvent, setOldEvent] = useState([]);

  const navigation = useNavigation();

  // Get user info from Redux store to check if admin
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id } = userInfo;

  const isAdmin = userInfo?.user_roles == ACCOUNT_TYPE_ADMIN;

  // Fetch events when screen loads or returns to focus
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await getAllEvent({ token });
      setEvents(response.data.event);
      setOldEvent(response.data.event);
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      Alert.alert("Error", "Failed to load events");
      setEvents([]);
    }
  };

  const addParticipant = async (eventId) => {
    const response = await addParticipantRequest({
      userId: _id,
      token,
      eventId,
    });
    if (response.status == 200) {
      Alert.alert("Action !!", response.data);
      fetchEvents();
    }
  };

  // // Filter events for selected date
  // const getEventsForSelectedDate = () => {
  //   if (!selectedDate) return [];
  //   return events.filter(event => {
  //     const eventDate = event.event_date.split('T')[0];
  //     return eventDate === selectedDate;
  //   });
  // };

  // Component to display individual event details
  const EventCard = ({ event }) => {
    const isParticipated = event.participants
      ? event.participants.includes(_id)
      : false;
    
    // Determine event type - default to "regular" if not specified
    const eventType = event.event_type || "regular";

    return (
      <View style={styles.eventCard}>
        {/* Event Title and Type Tag */}
        <View style={styles.eventHeaderRow}>
          <Text style={styles.eventTitle}>{event.event_title}</Text>
          <View style={[
            styles.eventTypeTag, 
            {backgroundColor: eventType === "workshop" ? "#e0f2f1" : "#f0f7ff"}
          ]}>
            <Text style={[
              styles.eventTypeText,
              {color: eventType === "workshop" ? "#00796b" : "#1976d2"}
            ]}>
              {eventType === "workshop" ? "Workshop" : "Event"}
            </Text>
          </View>
        </View>

        {/* Event Location */}
        <View style={styles.locationContainer}>
          <Text style={styles.eventLocation}>{event.event_location}</Text>
        </View>

        {/* Event Description */}
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.event_desc}
        </Text>

        {/* Event Link */}
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            flex: 1,
            justifyContent: "space-between",
            paddingTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => Linking.openURL(event.event_link)}
            style={styles.linkContainer}
          >
            <Text style={styles.eventLink}>View Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isParticipated}
            onPress={() => {
              isAdmin ? navigation.navigate("ParticipantList", { event }) :addParticipant(event._id);
            }}
            style={[
              styles.linkContainer,
              { backgroundColor: isParticipated ? "#e0e0e0" : "#fff" },
            ]} // Use the appropriate background color based on isParticipated styles.linkContainer}
          >
            <Text
              style={[
                styles.eventLink,
                { color: isParticipated ? "#000" : "#0066cc" },
              ]}
            >
              {" "}
              {isAdmin
                ? "Participant list"
                : isParticipated
                ? "Requested"
                : "Add Participate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const _getEventDate = () => {
    let eventDate = {};
    oldEvent.map((event) => {
      eventDate[event.event_date] = {
        marked: true,
        dotColor: "#097969",
      };
    });
    if (selectedDate) {
      eventDate[selectedDate] = {
        selected: true,
        selectedColor: "#097969",
      };
    }
    return eventDate;
  };

  const _filterEvent = (day) => {
    setSelectedDate(day.dateString);

    const result = oldEvent.filter((event) => {
      return event.event_date == day.dateString;
    });
    setEvents(result);
  };

  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <View style={styles.container}>
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            style={{
              width: Dimensions.get("screen").width,
              alignSelf: "center",
            }}
            onDayPress={(day) => {
              _filterEvent(day);
            }}
            markedDates={_getEventDate()}
            theme={{
              textDayFontSize: 16,
              todayTextColor: "#097969", // Set today's date text color to green
              arrowColor: "#097969", // Set month navigation arrows to green
            }}
          />
        </View>

        {/* Add Event Button (Admin Only) */}
        {isAdmin && (
          <View style={styles.addEventButtonContainer}>
            <View style={{ width: "90%" }}>
              <AppPrimaryButton
                title={"Add Event"}
                handleSubmit={() => {
                  navigation.navigate("CreateEvent");
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.eventsListContainer}>
          {events.length == 0 ? (
            <Text> No event for selected date</Text>
          ) : (
            events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingBottom: 20,
  },
  calendarContainer: {
    width: "100%",
    backgroundColor: "white",
  },
  addEventButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "white",
  },
  eventsListContainer: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  eventTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationContainer: {
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  eventDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
    lineHeight: 20,
  },
  linkContainer: {},
  eventLink: {
    color: "#0066cc",
    fontSize: 14,
    padding: 2,
  },
  noEventsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  selectDateText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
});

export default EventsScreen;
