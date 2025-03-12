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
} from "react-native";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";

const EventsScreen = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();

  // Get user info from Redux store to check if admin
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.token.token);
  const isAdmin = userInfo?.user_roles == ACCOUNT_TYPE_ADMIN;

  // Fetch events when screen loads or returns to focus
  useEffect(() => {
    fetchEvents();
    
    // Set up listener for screen focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });

    // Cleanup listener on component unmount
    return unsubscribe;
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const eventsArray = Array.isArray(response.data) 
        ? response.data 
        : Object.values(response.data);
      setEvents(eventsArray);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      Alert.alert("Error", "Failed to load events");
      setEvents([]);
    }
  };

  // Filter events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = event.event_date.split('T')[0];
      return eventDate === selectedDate;
    });
  };

  // Component to display individual event details
  const EventCard = ({ event }) => {
    return (
      <View style={styles.eventCard}>
        {/* Event Title */}
        <Text style={styles.eventTitle}>
          {event.event_title}
        </Text>
        
        {/* Event Location */}
        <View style={styles.locationContainer}>
          <Text style={styles.eventLocation}>
            {event.event_location}
          </Text>
        </View>
        
        {/* Event Description */}
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.event_desc}
        </Text>
        
        {/* Event Link */}
        <TouchableOpacity 
          onPress={() => Linking.openURL(event.event_link)}
          style={styles.linkContainer}
        >
          <Text style={styles.eventLink}>View Event Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Get events for the selected date
  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View style={styles.container}>
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            style={{
              width: '100%',
              alignSelf: 'center',
            }}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              ...events.reduce((acc, event) => {
                const dateStr = event.event_date.split('T')[0];
                acc[dateStr] = {
                  marked: true,
                  selectedColor: "green"
                };
                return acc;
              }, {}),
              [selectedDate]: {
                selected: true,
                selectedColor: "green"
              }
            }}
            theme={{
              textDayFontWeight: "normal",
              textDayFontSize: 16,
              dotColor: "green",
              todayTextColor: "#000000",
            }}
          />
        </View>

        {/* Add Event Button (Admin Only) */}
        {isAdmin && (
          <View style={styles.addEventButtonContainer}>
            <View style={{ width: '90%' }}>
              <AppPrimaryButton
                title={"Add Event"}
                handleSubmit={() => {
                  navigation.navigate("CreateEvent");
                }}
              />
            </View>
          </View>
        )}

        {/* Selected Date Events Section */}
        <View style={styles.eventsListContainer}>
          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event, index) => (
                <EventCard key={index} event={event} />
              ))
            ) : (
              <Text style={styles.noEventsText}>
                No events scheduled for {selectedDate}
              </Text>
            )
          ) : (
            <Text style={styles.selectDateText}>
              Select a date to view events
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingBottom: 20
  },
  calendarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white'
  },
  addEventButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: 'white'
  },
  eventsListContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white'
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  locationContainer: {
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    lineHeight: 20,
  },
  linkContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  eventLink: {
    color: '#0066cc',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20
  },
  selectDateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20
  }
});

export default EventsScreen;