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
  Modal,
  FlatList,
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
import MY_IP_ADDRESS from "../environment_variables.mjs";

const EventsScreen = () => {
  // Helper function to format date and time
  const formatEventDateTime = (dateStr, startTime, endTime) => {
    if (!dateStr) return "";
    
    // Parse the date - ensure we're using the correct date by handling timezone issues
    // Format: YYYY-MM-DD (e.g., 2025-03-29)
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    
    // Create date using UTC to avoid timezone issues (months are 0-indexed in JS)
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getUTCDay()];
    
    // Get month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[date.getUTCMonth()];
    
    // Format date - use UTC methods to avoid timezone issues
    const dayOfMonth = date.getUTCDate();
    
    // Format time (convert 24h to 12h with am/pm)
    const formatTime = (timeStr) => {
      if (!timeStr) return "";
      
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'pm' : 'am';
      const hour12 = hour % 12 || 12; // Convert 0 to 12
      
      // If minutes is 00, just show the hour
      if (minute === 0) {
        return `${hour12}${period}`;
      }
      
      return `${hour12}:${minutes.padStart(2, '0')}${period}`;
    };
    
    // Format the full date and time string
    let formattedDateTime = `${dayOfWeek}, ${monthName} ${dayOfMonth}`;
    
    if (startTime) {
      formattedDateTime += ` · ${formatTime(startTime)}`;
      
      if (endTime) {
        formattedDateTime += ` - ${formatTime(endTime)}`;
      }
    }
    
    return formattedDateTime;
  };

  // State management
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEvents] = useState([]);
  const [oldEvent, setOldEvent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [sortOption, setSortOption] = useState("date"); // "date" or "interested"

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
  
  // State for event type filter
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  
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
      if (params.filterType) {
        // If filterType is provided, apply it and clear date filter
        setEventTypeFilter(params.filterType);
        setSelectedDate(""); // Clear selected date to show all events of this type
      } else if (params.showAll) {
        // Coming from navbar Events tab click - show all events
        setSelectedDate(""); // Clear selected date to show all events
        setEventTypeFilter(""); // Clear event type filter
      } else if (params.preserveDate && params.selectedDate) {
        // Coming back from InterestedList with a specific date
        setSelectedDate(params.selectedDate);
      }
      
      // Clear the params after handling them to avoid reapplying on future focus events
      if (params.showAll || params.preserveDate || params.filterType || params.selectedDate) {
        navigation.setParams({ 
          showAll: undefined, 
          preserveDate: undefined, 
          selectedDate: undefined,
          filterType: undefined
        });
      }
    });
    
    // Cleanup the listener when the component is unmounted
    return unsubscribe;
  }, [navigation]);
  
  // Sort events based on the selected sort option
  const sortEvents = (eventsToSort) => {
    if (sortOption === "date") {
      // Sort by date (and time if available)
      return [...eventsToSort].sort((a, b) => {
        // First compare dates
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();
        
        if (dateA !== dateB) {
          return dateA - dateB; // Sort by date if dates are different
        }
        
        // If dates are the same, sort by time if available
        if (a.event_time && b.event_time) {
          return a.event_time.localeCompare(b.event_time);
        }
        
        return 0; // Keep original order if no time available
      });
    } else if (sortOption === "interested") {
      // Sort by interested status first, then by date
      return [...eventsToSort].sort((a, b) => {
        const isInterestedA = a.participants && a.participants.includes(_id);
        const isInterestedB = b.participants && b.participants.includes(_id);
        
        // First prioritize events the user is interested in
        if (isInterestedA && !isInterestedB) return -1;
        if (!isInterestedA && isInterestedB) return 1;
        
        // If both have same interested status, sort by date
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();
        
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        
        // If dates are the same, sort by time if available
        if (a.event_time && b.event_time) {
          return a.event_time.localeCompare(b.event_time);
        }
        
        return 0;
      });
    }
    
    // Default to date sorting
    return eventsToSort;
  };

  // Filter events when selectedDate, eventTypeFilter, or sortOption changes
  useEffect(() => {
    if (oldEvent.length > 0) {
      let filteredEvents = [...oldEvent];
      
      // Apply date filter if a date is selected
      if (selectedDate) {
        filteredEvents = filteredEvents.filter(event => 
          event.event_date === selectedDate
        );
      }
      
      // Apply event type filter if specified
      if (eventTypeFilter) {
        filteredEvents = filteredEvents.filter(event => {
          const eventType = event.event_type || "regular"; // Default to "regular" if not specified
          return eventType === eventTypeFilter;
        });
      }
      
      // Filter for "interested" events if that option is selected
      if (sortOption === "interested") {
        filteredEvents = filteredEvents.filter(event => 
          event.participants && event.participants.includes(_id)
        );
      }
      
      // Apply sorting based on selected option (date sorting for both options)
      filteredEvents = filteredEvents.sort((a, b) => {
        // First compare dates
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();
        
        if (dateA !== dateB) {
          return dateA - dateB; // Sort by date if dates are different
        }
        
        // If dates are the same, sort by time if available
        if (a.event_time && b.event_time) {
          return a.event_time.localeCompare(b.event_time);
        }
        
        return 0; // Keep original order if no time available
      });
      
      setEvents(filteredEvents);
    }
  }, [oldEvent, selectedDate, eventTypeFilter, sortOption]);

  // Fetch events from API and sort by date
  const fetchEvents = async () => {
    try {
      const response = await getAllEvent({ token,navigation });
      
      // Sort events by date in ascending order
      const sortedEvents = [...response.data.event].sort((a, b) => {
        // Convert dates to timestamps for comparison
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();
        return dateA - dateB; // Ascending order
      });
      
      setEvents(sortedEvents);
      setOldEvent(sortedEvents);
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      Alert.alert("Error", "Failed to load events");
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Event actions
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const showEventOptions = (event, nativeEvent) => {
    setSelectedEvent(event);
    
    // For non-admin users, show event details directly
    if (!isAdmin) {
      setEventDetailsVisible(true);
      return;
    }
    
    // For admin users, show the options menu
    // Get the screen width
    const screenWidth = Dimensions.get('window').width;
    
    // Position the menu with its right edge at the click position, with offsets
    setMenuPosition({ 
      top: nativeEvent.pageY - 50, // Offset to move up
      right: screenWidth - nativeEvent.pageX + 25 // Right edge at click position with offset to the left
    });
    
    setOptionsVisible(true);
  };
  
  const confirmDeleteEvent = () => {
    setOptionsVisible(false);
    setEventToDelete(selectedEvent);
    
    // Use setTimeout to ensure the delete confirmation modal appears after the options modal is closed
    setTimeout(() => {
      setDeleteConfirmVisible(true);
    }, 100);
  };
  
  const deleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const response = await fetch(`http://${MY_IP_ADDRESS}:5050/events/delete/${eventToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove the deleted event from the state
        const updatedEvents = events.filter(event => event._id !== eventToDelete._id);
        setEvents(updatedEvents);
        
        const updatedOldEvents = oldEvent.filter(event => event._id !== eventToDelete._id);
        setOldEvent(updatedOldEvents);
        
        Alert.alert("Success", "Event deleted successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Failed to delete event");
    } finally {
      setDeleteConfirmVisible(false);
      setEventToDelete(null);
    }
  };
  
  // Handle pull-to-refresh - show all events (clear filters)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEvents();
    // Clear filters
    setSelectedDate("");
    setEventTypeFilter("");
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
      
      // Update the selectedEvent to show the "Thank you" message immediately
      if (selectedEvent && selectedEvent._id === eventId) {
        // Create a copy of the selected event
        const updatedEvent = { ...selectedEvent };
        
        // Add the user to participants if not already there
        if (!updatedEvent.participants) {
          updatedEvent.participants = [_id];
        } else if (!updatedEvent.participants.includes(_id)) {
          updatedEvent.participants = [...updatedEvent.participants, _id];
        }
        
        // Update the selected event state
        setSelectedEvent(updatedEvent);
      }
      
      // Refresh all events
      fetchEvents();
    }
  };

  // Component to display individual event details
  const EventCard = ({ event, index }) => {
    const isParticipated = event.participants
      ? event.participants.includes(_id)
      : false;
    
    // Determine event type - default to "regular" if not specified
    const eventType = event.event_type || "regular";

    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => showEventOptions(event, {})} // Open details modal on card click
        activeOpacity={0.8}
      >
        {/* Event Title with Options Menu */}
        <View style={styles.titleRow}>
          <Text style={styles.eventTitle}>{event.event_title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation(); // Prevent card click
              showEventOptions(event, e.nativeEvent);
            }}
            style={styles.optionsButton}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
        
        {/* Event Date and Time */}
        {event.event_date && (
          <Text style={styles.eventTime}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            {" "}{formatEventDateTime(event.event_date, event.event_time, event.event_end_time)}
          </Text>
        )}
        
        {/* Event Location */}
        <Text style={styles.eventLocation}>
          <Ionicons name="location-outline" size={14} color="#666" />
          {" "}{event.event_location}
        </Text>

        {/* Event Type Tag */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>
            {eventType === "workshop" ? "Workshop" : "Event"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _getEventDate = () => {
    let eventDate = {};
    
    // Process each event
    oldEvent.forEach((event) => {
      const date = event.event_date;
      
      // For admin users, check if any user is interested
      // For regular users, check if the current user is interested
      const hasParticipants = event.participants && event.participants.length > 0;
      const isInterested = isAdmin 
        ? hasParticipants 
        : (event.participants && event.participants.includes(_id));
      
      if (!eventDate[date]) {
        // Initialize with dots array for multi-dot support
        eventDate[date] = {
          marked: true,
          dots: [
            { key: 'event', color: '#097969' } // Green dot for all events
          ]
        };
      }
      
      // If user is interested in this event (or any user for admin), add a red dot
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

    // Filter events for the selected date
    const result = oldEvent.filter((event) => {
      return event.event_date == day.dateString;
    });
    
    // Apply the current sort option to the filtered events
    const sortedResult = sortEvents(result);
    
    setEvents(sortedResult);
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
      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsVisible}
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsVisible(false)}
        >
          <View style={[
            styles.optionsModalContent,
            { top: menuPosition.top, right: menuPosition.right }
          ]}>
            {/* Event Details option for all users */}
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setOptionsVisible(false);
                setEventDetailsVisible(true);
              }}
            >
              <Ionicons name="information-circle-outline" size={20} color="#333" />
              <Text style={styles.optionText}>Event Details</Text>
            </TouchableOpacity>
            
            {/* Admin-only options */}
            {isAdmin && (
              <>
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => {
                    setOptionsVisible(false);
                    navigation.navigate("InterestedList", { event: selectedEvent });
                  }}
                >
                  <Ionicons name="people-outline" size={20} color="#333" />
                  <Text style={styles.optionText}>Interested List</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => {
                    setOptionsVisible(false);
                    // Navigate to CreateEvent screen with event data for updating
                    navigation.navigate("Create Event", { 
                      eventToUpdate: selectedEvent,
                      isUpdating: true 
                    });
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#333" />
                  <Text style={styles.optionText}>Update Event</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={confirmDeleteEvent}
                >
                  <Ionicons name="trash-outline" size={20} color="#333" />
                  <Text style={styles.optionText}>Delete Event</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.deleteModalContent,
            { 
              position: 'absolute',
              top: menuPosition.top,
              right: menuPosition.right
            }
          ]}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this event?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={deleteEvent}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eventDetailsVisible}
        onRequestClose={() => setEventDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventDetailsModalContent}>
            {selectedEvent && (
              <>
                <View style={styles.eventDetailsHeader}>
                  <Text style={styles.eventDetailsTitle}>{selectedEvent.event_title}</Text>
                  <TouchableOpacity 
                    onPress={() => setEventDetailsVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.eventDetailsScrollView}>
                  {/* Date and Time */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Date & Time</Text>
                      <Text style={styles.eventDetailText}>
                        {formatEventDateTime(selectedEvent.event_date, selectedEvent.event_time, selectedEvent.event_end_time)}
                      </Text>
                  </View>
                  
                  {/* Location */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Location</Text>
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.event_location}
                    </Text>
                  </View>
                  
                  {/* Description */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Description</Text>
                    <Text style={styles.eventDetailText}>
                      {selectedEvent.event_desc}
                    </Text>
                  </View>
                  
                  {/* Links */}
                  <View style={styles.eventDetailSection}>
                    <Text style={styles.eventDetailLabel}>Event Link</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(selectedEvent.event_link)}
                    >
                      <Text style={styles.eventDetailLink}>
                        Open Event Link
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Ticket URL if available */}
                  {selectedEvent.ticket_url && (
                    <View style={styles.eventDetailSection}>
                      <Text style={styles.eventDetailLabel}>Tickets</Text>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(selectedEvent.ticket_url)}
                      >
                        <Text style={styles.eventDetailLink}>
                          Get Tickets
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Interested Button or Thank You Message - Only for non-admin users */}
                  {!isAdmin && (
                    <View style={styles.eventDetailSection}>
                      {selectedEvent.participants && selectedEvent.participants.includes(_id) ? (
                        <View style={styles.thankYouContainer}>
                          <Text style={styles.thankYouText}>Thank you for your interest!</Text>
                        </View>
                      ) : (
                        <AppPrimaryButton 
                          title="Interested?" 
                          handleSubmit={() => addParticipant(selectedEvent._id)}
                        />
                      )}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
                  navigation.navigate("Create Event");
                }}
              />
            </View>
          </View>
        )}

        {/* Toggle Filter - Only for non-admin users */}
        {events.length > 0 && !isAdmin && (
          <View style={styles.sortFilterContainer}>
            <View style={styles.sortButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOption === "date" && styles.sortButtonActive
                ]}
                onPress={() => setSortOption("date")}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOption === "date" && styles.sortButtonTextActive
                  ]}
                >
                  Date
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOption === "interested" && styles.sortButtonActive
                ]}
                onPress={() => setSortOption("interested")}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOption === "interested" && styles.sortButtonTextActive
                  ]}
                >
                  Interested
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.eventsListContainer}>
          {events.length == 0 ? (
            <Text> No event for selected date</Text>
          ) : (
            events.map((event, index) => (
              <EventCard key={index} event={event} index={index} />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '50%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: 250,
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteConfirmButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#333',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Title row with delete button
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsButton: {
    padding: 5,
  },
  optionsModalContent: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
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
    flex: 1,
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
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
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
  // Status row for event type and interested status
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  interestedTag: {
    backgroundColor: '#e6f7ff',
    color: '#0066cc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginTop: 5,
  },
  // Event Details Modal styles
  eventDetailsModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    marginTop: '20%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 15,
  },
  eventDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  eventDetailsScrollView: {
    padding: 15,
  },
  eventDetailSection: {
    marginBottom: 20,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  eventDetailLink: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 5,
  },
  // Thank you message styles
  thankYouContainer: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thankYouText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
  // Sort filter styles
  sortFilterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light gray border for subtlety
    padding: 0,
    width: 160,
    height: 36,
    overflow: 'hidden',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  sortButtonActive: {
    backgroundColor: '#f0f8f6', // Very light green background
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666', // Gray text for inactive state
  },
  sortButtonTextActive: {
    color: '#097969', // Green text for active state
    fontWeight: '600',
  },
});

export default EventsScreen;
