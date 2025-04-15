import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppPrimaryButton from "../components/AppPrimaryButton";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Calendar } from "react-native-calendars";

const CreateEvent = ({ route }) => {
  // Check if we're updating an existing event
  const isUpdating = route.params?.isUpdating || false;
  const eventToUpdate = route.params?.eventToUpdate || null;
  // Navigation hook for moving between screens
  const navigation = useNavigation();
  
  // Get user_id from Redux store for event creation
  const user_id = useSelector((store) => store.user_id.user_id);

  // Get token from Redux
  const token = useSelector((store) => store.token.token); 
  
  // State to control picker modal visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // State to manage form data - matches the API endpoint requirements
  const [eventData, setEventData] = useState({
    event_title: "",
    event_location: "",
    event_date: "",
    event_time: "", // Start time
    event_end_time: "", // End time
    event_desc: "",
    event_link: "",
    ticket_url: "", // New field for ticket URL
    event_type: "regular", // Default to regular event
    is_featured_ticket: false, // New field to mark event as featured in "Get Your Tickets" section
    user_id: user_id  // Include user_id who created the event
  });
  
  // Pre-populate form if updating an existing event
  useEffect(() => {
    if (isUpdating && eventToUpdate) {
      setEventData({
        event_title: eventToUpdate.event_title || "",
        event_location: eventToUpdate.event_location || "",
        event_date: eventToUpdate.event_date || "",
        event_time: eventToUpdate.event_time || "",
        event_end_time: eventToUpdate.event_end_time || "",
        event_desc: eventToUpdate.event_desc || "",
        event_link: eventToUpdate.event_link || "",
        ticket_url: eventToUpdate.ticket_url || "", // Include ticket URL in pre-populated data
        event_type: eventToUpdate.event_type || "regular",
        is_featured_ticket: eventToUpdate.is_featured_ticket || false, // Include featured ticket flag
        user_id: user_id
      });
    }
  }, [isUpdating, eventToUpdate]);
  
  // State to control event type dropdown
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);

  // Format time display for UI
  const formatTimeDisplay = () => {
    if (eventData.event_time && eventData.event_end_time) {
      return `${eventData.event_time} - ${eventData.event_end_time}`;
    } else if (eventData.event_time) {
      return `${eventData.event_time}${eventData.event_end_time ? ` - ${eventData.event_end_time}` : ''}`;
    } else {
      return "Select Time";
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!eventData.event_title || !eventData.event_location || 
          !eventData.event_date || !eventData.event_time || !eventData.event_desc || !eventData.event_link) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }
      
      // Prepare request data
      const requestData = {
        event_title: eventData.event_title,
        event_desc: eventData.event_desc,
        event_link: eventData.event_link,
        event_location: eventData.event_location,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        event_end_time: eventData.event_end_time,
        ticket_url: eventData.ticket_url, // Include ticket URL in request data
        is_featured_ticket: eventData.is_featured_ticket, // Include featured ticket flag
        user_id: eventData.user_id,
        event_type: eventData.event_type,
        requestType: "EVENT"
      };
      
      let response;
      
      if (isUpdating && eventToUpdate) {
        // Update existing event
        response = await axios.put(
          `http://${MY_IP_ADDRESS}:5050/events/update/${eventToUpdate._id}`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          Alert.alert("Success", "Event updated successfully", [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]);
        }
      } else {
        // Create new event
        response = await axios.post(
          `http://${MY_IP_ADDRESS}:5050/events/create`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          Alert.alert("Success", "Event created successfully", [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]);
        }
      }
    } catch (error) {
      console.error("Error response:", error.response?.data);
      const action = isUpdating ? "update" : "create";
      Alert.alert("Error", error.response?.data?.message || `Failed to ${action} event`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
      {/* Event Name Input */}
      <Text style={styles.label}>Event Name:</Text>
      <TextInput
        value={eventData.event_title}
        onChangeText={(text) => setEventData({...eventData, event_title: text})}
        style={styles.input}
        placeholder="Enter event name"
      />

      {/* Event Location Input */}
      <Text style={styles.label}>Event Location:</Text>
      <TextInput
        value={eventData.event_location}
        onChangeText={(text) => setEventData({...eventData, event_location: text})}
        style={styles.input}
        placeholder="Enter location"
      />

      {/* Date Input - Clickable field to show date picker */}
      <Text style={styles.label}>Event Date:</Text>
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        style={styles.dateInput}
      >
        <View style={styles.dropdownButtonContent}>
          <Text style={eventData.event_date ? styles.dateText : styles.placeholderText}>
            {eventData.event_date || "Select Date"}
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Time Input - Clickable field to show time picker */}
      <Text style={styles.label}>Event Time:</Text>
      <View style={styles.timeRangeContainer}>
        {/* Start Time */}
        <TouchableOpacity 
          onPress={() => setShowStartTimePicker(true)}
          style={[styles.dateInput, { flex: 1, marginRight: 5 }]}
        >
          <View style={styles.dropdownButtonContent}>
            <Text style={eventData.event_time ? styles.dateText : styles.placeholderText}>
              {eventData.event_time || "Start Time"}
            </Text>
            <Ionicons name="time-outline" size={16} color="#666" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.toText}>to</Text>
        
        {/* End Time */}
        <TouchableOpacity 
          onPress={() => setShowEndTimePicker(true)}
          style={[styles.dateInput, { flex: 1, marginLeft: 5 }]}
        >
          <View style={styles.dropdownButtonContent}>
            <Text style={eventData.event_end_time ? styles.dateText : styles.placeholderText}>
              {eventData.event_end_time || "End Time"}
            </Text>
            <Ionicons name="time-outline" size={16} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Event Description Input - Multiline for longer text */}
      <Text style={styles.label}>Event Description:</Text>
      <TextInput
        value={eventData.event_desc}
        onChangeText={(text) => setEventData({...eventData, event_desc: text})}
        style={[styles.input, { height: 80 }]}
        multiline
        placeholder="Enter event description"
      />

      {/* Event Link Input */}
      <Text style={styles.label}>Event Link:</Text>
      <TextInput
        value={eventData.event_link}
        onChangeText={(text) => setEventData({...eventData, event_link: text})}
        style={styles.input}
        placeholder="Enter event link"
      />

      {/* Ticket URL Input */}
      <Text style={styles.label}>Ticket URL:</Text>
      <TextInput
        value={eventData.ticket_url}
        onChangeText={(text) => setEventData({...eventData, ticket_url: text})}
        style={styles.input}
        placeholder="Enter ticket URL (optional)"
      />

      {/* Event Type Dropdown */}
      <Text style={styles.label}>Event Type:</Text>
      <TouchableOpacity 
        onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
        style={styles.dropdownButton}
      >
        <View style={styles.dropdownButtonContent}>
          <Text style={styles.dropdownButtonText}>
            {eventData.event_type === "regular" ? "Regular Event" : "Workshop & Repair Cafe"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </View>
      </TouchableOpacity>
      
      {/* Featured Ticket Event Checkbox - Only show if ticket URL is provided */}
      {eventData.ticket_url && (
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setEventData({
            ...eventData, 
            is_featured_ticket: !eventData.is_featured_ticket
          })}
        >
          <View style={[
            styles.checkbox, 
            eventData.is_featured_ticket && styles.checkboxChecked
          ]}>
            {eventData.is_featured_ticket && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            Feature this event in "Get Your Tickets" section on home screen
          </Text>
        </TouchableOpacity>
      )}
      
      {showEventTypeDropdown && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[
              styles.dropdownItem, 
              eventData.event_type === "regular" && styles.selectedItem
            ]}
            onPress={() => {
              setEventData({...eventData, event_type: "regular"});
              setShowEventTypeDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Regular Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.dropdownItem, 
              eventData.event_type === "workshop" && styles.selectedItem
            ]}
            onPress={() => {
              setEventData({...eventData, event_type: "workshop"});
              setShowEventTypeDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Workshop & Repair Cafe</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Button - Uses custom AppPrimaryButton component */}
      <AppPrimaryButton 
        title={isUpdating ? "Update Event" : "Add Event"} 
        handleSubmit={handleSubmit} 
      />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Calendar Component */}
            <Calendar
              onDayPress={(day) => {
                // Update event date and close modal when date is selected
                setEventData({...eventData, event_date: day.dateString});
                setShowDatePicker(false);
              }}
              // Prevent selecting past dates
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: 'green',
                selectedDayTextColor: 'white',
                todayTextColor: 'green',
                arrowColor: 'green',
              }}
            />
            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Start Time Picker Modal */}
      <Modal
        visible={showStartTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.timePickerTitle}>Select Start Time</Text>
            
            {/* Simple Time Picker */}
            <View style={styles.timePickerContainer}>
              {/* Hours */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScrollView}>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <TouchableOpacity
                      key={`hour-${hour}`}
                      style={[
                        styles.timeOption,
                        eventData.event_time.startsWith(hour.toString().padStart(2, '0')) && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        const currentTime = eventData.event_time || '00:00';
                        const minutes = currentTime.split(':')[1] || '00';
                        const newTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
                        setEventData({...eventData, event_time: newTime});
                      }}
                    >
                      <Text style={styles.timeOptionText}>{hour.toString().padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              {/* Minutes */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <ScrollView style={styles.timeScrollView}>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <TouchableOpacity
                      key={`minute-${minute}`}
                      style={[
                        styles.timeOption,
                        eventData.event_time.endsWith(minute.toString().padStart(2, '0')) && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        const currentTime = eventData.event_time || '00:00';
                        const hours = currentTime.split(':')[0] || '00';
                        const newTime = `${hours}:${minute.toString().padStart(2, '0')}`;
                        setEventData({...eventData, event_time: newTime});
                      }}
                    >
                      <Text style={styles.timeOptionText}>{minute.toString().padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            {/* Done Button */}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setShowStartTimePicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            
            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowStartTimePicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End Time Picker Modal */}
      <Modal
        visible={showEndTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.timePickerTitle}>Select End Time</Text>
            
            {/* Simple Time Picker */}
            <View style={styles.timePickerContainer}>
              {/* Hours */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScrollView}>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <TouchableOpacity
                      key={`hour-${hour}`}
                      style={[
                        styles.timeOption,
                        eventData.event_end_time.startsWith(hour.toString().padStart(2, '0')) && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        const currentTime = eventData.event_end_time || '00:00';
                        const minutes = currentTime.split(':')[1] || '00';
                        const newTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
                        setEventData({...eventData, event_end_time: newTime});
                      }}
                    >
                      <Text style={styles.timeOptionText}>{hour.toString().padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              {/* Minutes */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <ScrollView style={styles.timeScrollView}>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <TouchableOpacity
                      key={`minute-${minute}`}
                      style={[
                        styles.timeOption,
                        eventData.event_end_time.endsWith(minute.toString().padStart(2, '0')) && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        const currentTime = eventData.event_end_time || '00:00';
                        const hours = currentTime.split(':')[0] || '00';
                        const newTime = `${hours}:${minute.toString().padStart(2, '0')}`;
                        setEventData({...eventData, event_end_time: newTime});
                      }}
                    >
                      <Text style={styles.timeOptionText}>{minute.toString().padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            {/* Done Button */}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setShowEndTimePicker(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            
            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowEndTimePicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles for form elements
const styles = StyleSheet.create({
  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#02833D',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#02833D',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  // Time range styles
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  toText: {
    marginHorizontal: 5,
    color: '#666',
  },
  // Time picker styles
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeColumn: {
    width: 80,
    height: 150,
  },
  timeColumnLabel: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  timeScrollView: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  timeOption: {
    padding: 10,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#e0f2f1',
  },
  timeOptionText: {
    fontSize: 16,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#02833D',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Dropdown styles
  dropdownButton: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center'
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#000',
    flex: 1
  },
  dropdownContainer: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  dropdownItemText: {
    fontSize: 14,
  },
  // Basic input field styling
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  // Label styling for all fields
  label: {
    fontSize: 15,
    color: "#424242",
    paddingVertical: 5,
  },
  // Date input field styling (looks like regular input)
  dateInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center'
  },
  // Style for selected date text
  dateText: {
    fontSize: 14,
    color: '#000'
  },
  // Style for date placeholder text
  placeholderText: {
    fontSize: 14,
    color: '#999'
  },
  // Modal background styling
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'  // Semi-transparent background
  },
  // Modal content container styling
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%'
  },
  // Cancel button styling
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  // Cancel button text styling
  closeButtonText: {
    color: 'red',
    fontSize: 16
  }
});

export default CreateEvent;
