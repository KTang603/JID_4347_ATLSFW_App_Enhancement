import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity } from "react-native";
import AppPrimaryButton from "../components/AppPrimaryButton";
import axios from "axios";
import MY_IP_ADDRESS from "../environment_variables.mjs";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { Calendar } from "react-native-calendars";
import { getAuthToken } from "../utils/TokenUtils";
import { setToken } from "../redux/actions/tokenAction";

const CreateEvent = () => {
  // Navigation hook for moving between screens
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Get user_id from Redux store for event creation
  const user_id = useSelector((store) => store.user_id.user_id);

  // Get token from Redux
  const reduxToken = useSelector((store) => store.token.token); 
  
  // State to control date picker modal visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State to manage form data - matches the API endpoint requirements
  const [eventData, setEventData] = useState({
    event_title: "",
    event_location: "",
    event_date: "",
    event_desc: "",
    event_link: "",
    user_id: user_id  // Include user_id who created the event
  });

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!eventData.event_title || !eventData.event_location || 
          !eventData.event_date || !eventData.event_desc || !eventData.event_link) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      setIsLoading(true);

      // Get token using our utility function
      const token = await getAuthToken(reduxToken);
      
      // If no token is available, navigate to login
      if (!token) {
        console.log('No authentication token available');
        setIsLoading(false);
        
        Alert.alert(
          "Authentication Required",
          "Please log in to create events",
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
  
      // Log the data we're about to send
      console.log('Sending event data:', eventData);
  
      const response = await axios.post(
        `http://${MY_IP_ADDRESS}:5050/events/create`,
        {
          event_title: eventData.event_title,
          event_desc: eventData.event_desc,
          event_link: eventData.event_link,
          event_location: eventData.event_location,
          event_date: eventData.event_date,
          user_id: eventData.user_id,
          requestType: "EVENT"
        },
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
      } else {
        Alert.alert("Error", response.data.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Log In')
            }
          ]
        );
      } else {
        Alert.alert(
          "Error", 
          error.response?.data?.message || "Failed to create event. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
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
        <Text style={eventData.event_date ? styles.dateText : styles.placeholderText}>
          {eventData.event_date || "Select Date"}
        </Text>
      </TouchableOpacity>

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

      {/* Submit Button - Uses custom AppPrimaryButton component */}
      <AppPrimaryButton 
        title={isLoading ? "Creating..." : "Add Event"} 
        handleSubmit={handleSubmit}
        disabled={isLoading}
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
    </View>
  );
};

// Styles for form elements
const styles = StyleSheet.create({
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