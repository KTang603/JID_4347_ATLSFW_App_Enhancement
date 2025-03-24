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
  Switch,
  ActivityIndicator
} from "react-native";
import { useSelector } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { getUserToken, storeUserToken } from "../utils/StorageUtils";

const EventsScreen = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState([]);
  const [oldEvent, setOldEvent] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  const navigation = useNavigation();

  // Get user info from Redux store to check if admin
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const isAdmin = userInfo?.user_roles == ACCOUNT_TYPE_ADMIN;

  // Get token from AsyncStorage when component mounts
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await getUserToken();
        setAuthToken(token);
      } catch (error) {
        console.error('Error getting token:', error);
      } finally {
        setIsTokenLoading(false);
      }
    };
    
    getToken();
  }, []);

  // Fetch events when screen loads or returns to focus and token is available
  useEffect(() => {
    if (!isTokenLoading && authToken) {
      fetchEvents();
    }
  }, [authToken, isTokenLoading]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`http://${MY_IP_ADDRESS}:5050/events`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      setEvents(response.data.event);
      setOldEvent(response.data.event);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      Alert.alert("Error", "Failed to load events");
      setEvents([]);
    }
  };

  // Component to display individual event details
  const EventCard = ({ event }) => {
    const [isInterested, setIsInterested] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Check if user is already interested when component mounts
    useEffect(() => {
      if (authToken) {
        checkUserInterest();
      }
    }, [authToken]);
    
    const checkUserInterest = async () => {
      try {
        // API call to check if user is already interested in this event
        const response = await axios.get(
          `http://${MY_IP_ADDRESS}:5050/events/${event.id}/interest`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        setIsInterested(response.data.interested);
      } catch (error) {
        console.error('Error checking interest:', error);
      }
    };
    
    const toggleInterest = async (newValue) => {
      setIsLoading(true);
      try {
        // API call to update interest status
        await axios.post(
          `http://${MY_IP_ADDRESS}:5050/events/${event.id}/interest`,
          { interested: newValue },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        setIsInterested(newValue);
      } catch (error) {
        console.error('Error updating interest:', error);
        Alert.alert("Error", "Failed to update interest status");
        // Revert the toggle if the API call fails
        setIsInterested(!newValue);
      } finally {
        setIsLoading(false);
      }
    };

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
        
        {/* Footer with Event Link and Interest Toggle */}
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            onPress={() => Linking.openURL(event.event_link)}
          >
            <Text style={styles.eventLink}>View Event</Text>
          </TouchableOpacity>

          <View style={styles.interestContainer}>
            <Text style={styles.interestLabel}>
              {isInterested ? "Interested" : "Interested?"}
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#097969" />
            ) : (
              <Switch
                value={isInterested}
                onValueChange={toggleInterest}
                trackColor={{ false: "#d3d3d3", true: "#c8e6c9" }}
                thumbColor={isInterested ? "#097969" : "#f4f3f4"}
                style={styles.interestSwitch}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const _getEventDate = () => {
    let eventDate = {};
    oldEvent.map(event => {
      eventDate[event.event_date] = {
        marked: true,
        dotColor: "#097969"
      };
    });
    if(selectedDate){
      eventDate[selectedDate] = {
        selected: true,
        selectedColor: "#097969"
      }
    } 
    return eventDate;
  }

  const _filterEvent = (day) => {
    setSelectedDate(day.dateString);

    const result = oldEvent.filter(event => {
      return event.event_date == day.dateString;
    });
    setEvents(result)
  }

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      {isTokenLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <ActivityIndicator size="large" color="#097969" />
          <Text style={{marginTop: 10, fontSize: 16, color: '#666'}}>Loading events...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Calendar Component */}
          <View style={styles.calendarContainer}>
            <Calendar
              style={{
                width: Dimensions.get('screen').width,
                alignSelf: 'center',
              }}
              onDayPress={(day) => {
                _filterEvent(day)
              }}
              markedDates={
                _getEventDate()
              }
              theme={{
                textDayFontSize: 16,
                todayTextColor: "#097969",
                arrowColor: "#097969",
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

          <View style={styles.eventsListContainer}>
            { 
              events.length == 0 ?
                <Text>No event for selected date</Text> :
                events.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))
            }
          </View>
        </View>
      )}
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
  },
  interestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  interestLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  
  interestSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],  // Makes the switch slightly smaller
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default EventsScreen;