import React, { useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';

const EventsScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({
    // Example event - replace with your actual events data
    '2025-02-19': {
      marked: true,
      dotColor: 'green'
    }
  });
  
  const userInfo = useSelector(state => state.userInfo?.userInfo);
  const isAdmin = userInfo?.user_roles === 3;

  // Separate marking for selected date (bold) and events (green dot)
  const markedDates = {
    ...events,  // Dates with events get green dots
    [selectedDate]: {
      // Only make the selected date bold, no color change
      selected: true,
      selectedTextColor: 'green',
      selectedColor: 'transparent',
      textStyle: {
        fontWeight: 'bold',
        color: 'green'
      }
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        style={{
          width: '85%',
          height: 300,  // This is approximately 75% of default height
          alignSelf: 'center',
          transform: [{scale: 0.85}],  // This scales both width and height uniformly
          //marginBottom: -50,  // This will pull up the content below the calendar
        }}
        onDayPress={day => {
          setSelectedDate(day.dateString);
        }}
        markedDates={markedDates}
        theme={{
          textDayFontWeight: 'normal',  // Normal weight for unselected dates
          textDayFontSize: 16,
          dotColor: 'green',  // Color for event dots
          todayTextColor: '#000000',  // Keep today's date black
        }}
      />
      
      {/* Add Event Button (Admin Only) */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.addEventButton}
          onPress={() => {
            if (!selectedDate) {
              Alert.alert('Select Date', 'Please select a date first');
              return;
            }
            // Add event logic will go here
            console.log('Add event clicked for date:', selectedDate);
          }}
        >
          <Text style={styles.addEventButtonText}>Add Event</Text>
        </TouchableOpacity>
      )}
      
      {/* Event display section */}
      {selectedDate && events[selectedDate] && (
        <View style={styles.eventContainer}>
          <Text style={styles.eventTitle}>{events[selectedDate].title}</Text>
          <Text style={styles.eventLocation}>{events[selectedDate].location}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  addEventButton: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 20,
    minWidth: 75,
  },
  addEventButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold'
  },
  eventContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  eventLocation: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5
  }
});

export default EventsScreen;