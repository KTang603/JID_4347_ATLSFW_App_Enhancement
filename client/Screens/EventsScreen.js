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
import { useSelector, useDispatch } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { getAuthToken, isTokenValid } from "../utils/TokenUtils";
import { setToken } from "../redux/actions/tokenAction";

const EventsScreen = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get user info from Redux store to check if admin
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const reduxToken = useSelector((state) => state.token.token);
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
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If no token is available, navigate to login
      if (!token) {
        console.log('No authentication token available');
        setIsLoading(false);
        
        // Show a brief message before redirecting
        Alert.alert(
          "Authentication Required",
          "Please log in to view events",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Log In')
            }
          ]
        );
        return;
      }

       // If token exists but isn't in Redux, update Redux
    if (!reduxToken && token) {
      dispatch(setToken(token));
    }
    
    // Make API request with token
    const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
      
      // Process response data
      const eventsArray = Array.isArray(response.data) 
        ? response.data 
        : response.data && typeof response.data === 'object'
          ? Object.values(response.data)
          : [];
      
      setEvents(eventsArray);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    
      // Handle token-related errors
      if (error.response && error.response.status === 401) {
        setError('Your session has expired.');
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.navigate('Log In');
        }, 1500);
      } else {
        setError('Failed to load events. Please try again later.');
      }
      
      setEvents([]);
      setIsLoading(false);
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
        {/* Display error message if there is one */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchEvents}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
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

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

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
  // Existing styles...
  
  // Add these new styles
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#02833D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
});

export default EventsScreen;