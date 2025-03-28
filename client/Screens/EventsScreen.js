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
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // Get user info from Redux store to check if admin
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id } = userInfo;

  const isAdmin = userInfo?.user_roles == ACCOUNT_TYPE_ADMIN;

  // Fetch events when screen loads or returns to focus
  useEffect(() => {
    fetchEvents();
    
    // Set today's date as the default selected date
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);
  
  // Add a listener for when the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh events when the screen is focused
      fetchEvents();
      
      // Get current route and its params
      const routes = navigation.getState()?.routes;
      const currentRoute = routes[routes.length - 1];
      const params = currentRoute?.params || {};
      
      // Handle different navigation scenarios
      if (params.showAll) {
        // Coming from navbar Events tab click - show all events
        setSelectedDate(""); // Clear selected date to show all events
      } else if (params.preserveDate && params.selectedDate) {
        // Coming back from InterestedList with a specific date
        setSelectedDate(params.selectedDate);
      }
      
      // Clear the params after handling them to avoid reapplying on future focus events
      if (params.showAll || params.preserveDate) {
        navigation.setParams({ showAll: undefined, preserveDate: undefined, selectedDate: undefined });
      }
    });
    
    // Cleanup the listener when the component is unmounted
    return unsubscribe;
  }, [navigation]);
  
  // Filter events when selectedDate changes or after fetching events
  useEffect(() => {
    if (oldEvent.length > 0) {
      if (selectedDate) {
        // If a date is selected, filter events for that date
        const filteredEvents = oldEvent.filter(event => 
          event.event_date === selectedDate
        );
        setEvents(filteredEvents);
      } else {
        // If no date is selected, show all events
        setEvents(oldEvent);
      }
    }
  }, [oldEvent, selectedDate]);

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
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh - show all events
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEvents();
    // Clear selected date to show all events
    setSelectedDate("");
  }, []);
  
  // Function to show all events (used when Events tab is clicked)
  const showAllEvents = () => {
    setEvents(oldEvent);
    setSelectedDate("");
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
        {/* Event Title */}
        <Text style={styles.eventTitle}>{event.event_title}</Text>

        {/* Event Location and Time */}
        <View style={styles.locationContainer}>
          <Text style={styles.eventLocation}>{event.event_location}</Text>
          {event.event_time && (
            <Text style={styles.eventTime}>
              <Ionicons name="time-outline" size={14} color="#02833D" /> {event.event_time}
            </Text>
          )}
        </View>

        {/* Event Description */}
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.event_desc}
        </Text>
        
        {/* Event Type Tag */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>
            {eventType === "workshop" ? "Workshop" : "Event"}
          </Text>
        </View>

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
              isAdmin ? navigation.navigate("InterestedList", { event }) :addParticipant(event._id);
            }}
            style={styles.linkContainer} // Remove the conditional background color
          >
            <Text
              style={[
                styles.eventLink,
                { color: isParticipated ? "#000" : "#0066cc" }, // Use black color when interested
              ]}
            >
              {" "}
              {isAdmin
                ? "Interested list"
                : isParticipated
                ? "Interested"
                : "Interested?"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const _getEventDate = () => {
    let eventDate = {};
    
    // Process each event
    oldEvent.forEach((event) => {
      const date = event.event_date;
      const isInterested = event.participants && event.participants.includes(_id);
      
      if (!eventDate[date]) {
        // Initialize with dots array for multi-dot support
        eventDate[date] = {
          marked: true,
          dots: [
            { key: 'event', color: '#097969' } // Green dot for all events
          ]
        };
      }
      
      // If user is interested in this event, add a red dot
      if (isInterested) {
        // Check if we already have dots for this date
        if (eventDate[date].dots) {
          // Add red dot if not already added
          const hasRedDot = eventDate[date].dots.some(dot => dot.key === 'interested');
          if (!hasRedDot) {
            eventDate[date].dots.push({ key: 'interested', color: '#e74c3c' }); // Red dot
          }
        }
      }
    });
    
    // Handle selected date
    if (selectedDate) {
      if (eventDate[selectedDate]) {
        // If the selected date already has dots, keep them and add selected property
        eventDate[selectedDate] = {
          ...eventDate[selectedDate],
          selected: true,
          selectedColor: '#097969',
        };
      } else {
        // If the selected date has no dots, just mark it as selected
        eventDate[selectedDate] = {
          selected: true,
          selectedColor: '#097969',
        };
      }
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
    <ScrollView 
      style={{ backgroundColor: "white" }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#097969"]}
          tintColor={"#097969"}
        />
      }
    >
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
            markingType="multi-dot" // Enable multi-dot support
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
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    marginBottom: 5,
  },
  tag: {
    backgroundColor: "#e0f2f1",
    color: "#00796b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 5,
    marginTop: 5,
  },
  locationContainer: {
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  eventTime: {
    fontSize: 14,
    color: "#02833D",
    marginTop: 4,
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
