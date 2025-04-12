import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
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
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import AppPrimaryButton from "../components/AppPrimaryButton";
import { ACCOUNT_TYPE_ADMIN } from "../Screens/ProfilePage";
import { Ionicons } from "@expo/vector-icons";
import {
  addParticipantRequest,
  getAllEvent,
} from "../redux/actions/eventAction";
import MY_IP_ADDRESS from "../environment_variables.mjs";

// Constants moved to the top for better readability
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Utility functions moved outside component for better performance
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const period = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return minute === 0 ? `${hour12}${period}` : `${hour12}:${minutes.padStart(2, '0')}${period}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = DAYS[date.getUTCDay()];
  const monthName = MONTHS[date.getUTCMonth()];
  const dayOfMonth = date.getUTCDate();
  return `${dayOfWeek}, ${monthName} ${dayOfMonth}`;
};

// Event card component with optimized rendering
const EventCard = React.memo(({ 
  event, 
  onCardPress, 
  onOptionsPress,
  isUserInterested,
  isAdmin 
}) => {
  const eventType = event.event_type || "regular";

  const handleOptionsPress = (e) => {
    e.stopPropagation();
    if (e && e.nativeEvent) {
      onOptionsPress(event, e.nativeEvent);
    } else {
      onOptionsPress(event, null);
    }
  };

  // Format date and time
  const formattedDate = formatDate(event.event_date);
  const formattedTimeRange = event.event_time 
    ? `${formatTime(event.event_time)}${event.event_end_time ? ` - ${formatTime(event.event_end_time)}` : ''}`
    : '';

  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onCardPress(event)}
      activeOpacity={0.8}
    >
      <View style={styles.titleRow}>
        <Text style={styles.eventTitle}>{event.event_title}</Text>
        <TouchableOpacity 
          onPress={handleOptionsPress}
          style={styles.optionsButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
      
      {event.event_date && (
        <Text style={styles.eventTime}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          {" "}{formattedDate}
          {formattedTimeRange ? ` · ${formattedTimeRange}` : ''}
        </Text>
      )}
      
      <Text style={styles.eventLocation}>
        <Ionicons name="location-outline" size={14} color="#666" />
        {" "}{event.event_location}
      </Text>

      <View style={styles.tagsRow}>
        <Text style={[styles.tag, { backgroundColor: eventType === "workshop" ? "#e0f2f1" : "#f0f8ff" }]}>
          {eventType === "workshop" ? "Workshop" : "Event"}
        </Text>
        {isUserInterested && !isAdmin && (
          <Text style={[styles.tag, { backgroundColor: "#ffebee", color: "#d32f2f" }]}>
            Interested
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Improved memoization logic
  return (
    prevProps.event._id === nextProps.event._id &&
    prevProps.event.event_title === nextProps.event.event_title &&
    prevProps.event.event_date === nextProps.event.event_date &&
    prevProps.event.event_time === nextProps.event.event_time &&
    prevProps.event.event_location === nextProps.event.event_location &&
    prevProps.event.event_type === nextProps.event.event_type &&
    prevProps.isUserInterested === nextProps.isUserInterested
  );
});

// EventDetails component extracted for better organization
const EventDetails = ({ 
  event, 
  isAdmin, 
  userId, 
  onClose, 
  onAddParticipant,
  isUserInterested 
}) => {
  if (!event) return null;

  const formattedDate = formatDate(event.event_date);
  const formattedTimeRange = event.event_time 
    ? `${formatTime(event.event_time)}${event.event_end_time ? ` - ${formatTime(event.event_end_time)}` : ''}`
    : '';
    
  return (
    <View style={styles.eventDetailsModalContent}>
      <View style={styles.eventDetailsHeader}>
        <Text style={styles.eventDetailsTitle}>{event.event_title}</Text>
        <TouchableOpacity 
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.eventDetailsScrollView}>
        <View style={styles.eventDetailSection}>
          <Text style={styles.eventDetailLabel}>Date & Time</Text>
          <Text style={styles.eventDetailText}>
            {formattedDate}
            {formattedTimeRange ? ` · ${formattedTimeRange}` : ''}
          </Text>
        </View>
        
        <View style={styles.eventDetailSection}>
          <Text style={styles.eventDetailLabel}>Location</Text>
          <Text style={styles.eventDetailText}>{event.event_location}</Text>
        </View>
        
        <View style={styles.eventDetailSection}>
          <Text style={styles.eventDetailLabel}>Description</Text>
          <Text style={styles.eventDetailText}>{event.event_desc}</Text>
        </View>
        
        {event.event_link && (
          <View style={styles.eventDetailSection}>
            <Text style={styles.eventDetailLabel}>Event Link</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL(event.event_link)}
              style={styles.linkButton}
            >
              <Text style={styles.eventDetailLink}>Open Event Link</Text>
              <Ionicons name="open-outline" size={16} color="#0066cc" />
            </TouchableOpacity>
          </View>
        )}
        
        {!isAdmin && (
          <View style={styles.eventDetailSection}>
            {isUserInterested ? (
              <View style={styles.thankYouContainer}>
                <Text style={styles.thankYouText}>Thank you for your interest!</Text>
              </View>
            ) : (
              <AppPrimaryButton 
                title="Interested?" 
                handleSubmit={() => onAddParticipant(event._id)}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const EventsScreen = () => {
  // Improved state management - grouped related states
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { eventType } = route.params || {};
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  
  // Event data states
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortOption, setSortOption] = useState("date");
  const [eventTypeFilter, setEventTypeFilter] = useState(eventType || "");
  
  // Modal states
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  
  // User data from Redux
  const userInfo = useSelector((state) => state.userInfo?.userInfo);
  const token = useSelector((state) => state.userInfo?.token);
  const { _id } = userInfo;
  const isAdmin = userInfo?.user_roles === ACCOUNT_TYPE_ADMIN;

  // Optimized event handlers
  const fetchEvents = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    
    try {
      const response = await getAllEvent({ token, navigation });
      setEvents(response.data.event);
    } catch (error) {
      console.error("Error loading events:", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [token, navigation]);

  const onRefresh = useCallback(() => {
    setEventTypeFilter("");
    fetchEvents(true);
  }, [fetchEvents]);

  const handleDayPress = useCallback((day) => {
    setSelectedDate(previous => previous === day.dateString ? "" : day.dateString);
  }, []);

  const handleMonthChange = useCallback((month) => {
    const newMonth = month.dateString.substring(0, 7);
    setCurrentMonth(newMonth);
    setSelectedDate("");
  }, []);

  const showEventDetails = useCallback((event) => {
    setSelectedEvent(event);
    setEventDetailsVisible(true);
  }, []);

  const closeEventDetails = useCallback(() => {
    setEventDetailsVisible(false);
  }, []);

  const showEventOptions = useCallback((event, nativeEvent) => {
    setSelectedEvent(event);
    
    // Calculate menu position using safe values
    const position = { top: 100, right: 20 };
    
    if (nativeEvent && typeof nativeEvent.pageY === 'number' && typeof nativeEvent.pageX === 'number') {
      const screenWidth = SCREEN_WIDTH;
      position.top = Math.max(0, nativeEvent.pageY - 50);
      position.right = Math.max(0, screenWidth - nativeEvent.pageX + 25);
    }
    
    setMenuPosition(position);
    setOptionsVisible(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedEvent) return;
    
    try {
      const response = await fetch(`http://${MY_IP_ADDRESS}:5050/events/delete/${selectedEvent._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setEvents(prev => prev.filter(event => event._id !== selectedEvent._id));
        Alert.alert("Success", "Event deleted successfully");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Failed to delete event");
    } finally {
      setDeleteConfirmVisible(false);
      setOptionsVisible(false);
      setSelectedEvent(null);
    }
  }, [selectedEvent, token]);

  const addParticipant = useCallback(async (eventId) => {
    try {
      const response = await addParticipantRequest({
        userId: _id,
        token,
        eventId,
      });
      
      if (response.status === 200) {
        Alert.alert("Success", "You are now interested in this event");
        
        // Update events list with optimistic update
        setEvents(prev => 
          prev.map(event => 
            event._id === eventId 
              ? { ...event, participants: [...(event.participants || []), _id] }
              : event
          )
        );
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      Alert.alert("Error", "Failed to register interest");
    }
  }, [_id, token]);

  // Reset filters when directly accessing the Events tab
  useFocusEffect(
    useCallback(() => {
      if (!route.params) {
        setEventTypeFilter("");
      }
    }, [route.params])
  );

  // Initial load with cleanup
  useEffect(() => {
    let mounted = true;
    
    const initializeEvents = async () => {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.substring(0, 7);
      
      if (mounted) {
        setCurrentMonth(thisMonth);
      }
      
      try {
        await fetchEvents();
      } catch (error) {
        if (mounted) {
          console.error("Error in initial load:", error);
        }
      }
    };

    initializeEvents();
    
    return () => {
      mounted = false;
    };
  }, [fetchEvents]);

  // Memoized filtered events based on date and event type
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Apply date filter
      if (selectedDate && event.event_date !== selectedDate) return false;

      // Apply month filter if no specific date is selected
      if (!selectedDate && currentMonth && event.event_date) {
        const eventMonth = event.event_date.substring(0, 7); // YYYY-MM format
        if (eventMonth !== currentMonth) return false;
      }
      
      // Apply type filter
      if (eventTypeFilter && (event.event_type || "regular") !== eventTypeFilter) return false;
      
      // Apply interest filter
      if (sortOption === "interested" && !event.participants?.includes(_id)) return false;
      
      return true;
    });
  }, [events, selectedDate, currentMonth, eventTypeFilter, sortOption, _id]);

  // Memoized sorted events
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.event_date || "2099-12-31").getTime();
      const dateB = new Date(b.event_date || "2099-12-31").getTime();
      
      if (dateA !== dateB) return dateA - dateB;
      
      // Then by time
      if (a.event_time && b.event_time) {
        return a.event_time.localeCompare(b.event_time);
      }
      
      return 0;
    });
  }, [filteredEvents]);

  // Memoized calendar date markings
  const eventDateMarkings = useMemo(() => {
    const markings = {};
    
    events.forEach(event => {
      const date = event.event_date;
      if (!date) return;
      
      const hasParticipants = event.participants?.length > 0;
      const isInterested = event.participants?.includes(_id);
      
      if (!markings[date]) {
        markings[date] = {
          marked: true,
          dots: [{ key: 'event', color: '#097969' }]
        };
      }
      
      if (isInterested && !markings[date].dots.some(dot => dot.key === 'interested')) {
        markings[date].dots.push({ key: 'interested', color: '#e74c3c' });
      }
    });

    // Add selected date properties
    if (selectedDate) {
      markings[selectedDate] = {
        ...(markings[selectedDate] || {}),
        selected: true,
        selectedColor: '#097969',
      };
    }

    return markings;
  }, [events, selectedDate, _id]);

  // Memoized empty state message based on filters
  const emptyStateMessage = useMemo(() => {
    if (sortOption === "interested") {
      if (selectedDate) {
        return "You're not interested in any events on this date";
      }
      return "You haven't shown interest in any events";
    }
    
    if (selectedDate) {
      return "No events for selected date";
    }
    
    return "No events match your current filters";
  }, [sortOption, selectedDate]);

  // Loading state
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#097969" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#097969"]}
          tintColor={"#097969"}
        />
      }
    >
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
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
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          <View style={[styles.optionsModalContent, { top: menuPosition.top, right: menuPosition.right }]}>
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
                  onPress={() => {
                    setOptionsVisible(false);
                    setDeleteConfirmVisible(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  <Text style={[styles.optionText, { color: '#e74c3c' }]}>Delete Event</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eventDetailsVisible}
        onRequestClose={closeEventDetails}
      >
        <View style={styles.modalOverlay}>
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent}
              isAdmin={isAdmin}
              userId={_id}
              onClose={closeEventDetails}
              onAddParticipant={addParticipant}
              isUserInterested={selectedEvent.participants?.includes(_id)}
            />
          )}
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={styles.calendarContainer}>
          <Calendar
            style={styles.calendar}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markingType="multi-dot"
            markedDates={eventDateMarkings}
            theme={{
              textDayFontSize: 16,
              todayTextColor: "#097969",
              arrowColor: "#097969",
            }}
          />
        </View>

        {isAdmin && (
          <View style={styles.addEventButtonContainer}>
            <AppPrimaryButton
              title="Add Event"
              handleSubmit={() => navigation.navigate("Create Event")}
            />
          </View>
        )}

        {!isAdmin && (
          <View style={styles.sortFilterContainer}>
            <View style={styles.sortButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortOption === "date" && styles.sortButtonActive
                ]}
                onPress={() => setSortOption("date")}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortOption === "date" && styles.sortButtonTextActive
                ]}>
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
                <Text style={[
                  styles.sortButtonText,
                  sortOption === "interested" && styles.sortButtonTextActive
                ]}>
                  Interested
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.eventsListContainer}>
          {refreshing ? null : (
            sortedEvents.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.noEventsText}>{emptyStateMessage}</Text>
              </View>
            ) : (
              sortedEvents.map((event, index) => (
                <EventCard 
                  key={event._id || index}
                  event={event}
                  onCardPress={showEventDetails}
                  onOptionsPress={showEventOptions}
                  isUserInterested={event.participants?.includes(_id)}
                  isAdmin={isAdmin}
                />
              ))
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: Dimensions.get('window').height,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  container: {
    backgroundColor: "white",
    paddingBottom: 20,
    flex: 1,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  optionsButton: {
    padding: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#e0f2f1",
    color: "#00796b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  optionsModalContent: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: 280,
    alignSelf: 'center',
    marginTop: '50%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 100,
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
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  eventDetailsModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    marginTop: '20%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  },
  closeButton: {
    padding: 5,
  },
  eventDetailsScrollView: {
    paddingVertical: 10,
  },
  eventDetailSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
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
  thankYouContainer: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  thankYouText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '500',
  },
  noEventsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
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
    borderColor: '#e0e0e0',
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
    backgroundColor: '#f0f8f6',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#097969',
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    width: '90%',
  },
  noEventsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  }
});

export default React.memo(EventsScreen);
