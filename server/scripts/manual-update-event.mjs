import axios from 'axios';
import { events_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";

// Function to get a JWT token for admin authentication
async function getAdminToken() {
  try {
    const response = await axios.post('http://localhost:5050/login', {
      email: 'admin@atlsfw.com',
      password: 'admin123'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Error getting admin token:', error.message);
    throw error;
  }
}

// Function to update an event with end time
async function updateEventWithEndTime() {
  try {
    // Get the event to update
    const eventId = "67e820c4e26b9a644f28e11f"; // The Atlanta Street Wear Market event
    const event = await events_db.collection('events').findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      console.error('Event not found');
      return;
    }
    
    console.log('Found event:', event.event_title);
    
    // Get admin token for authentication
    const token = await getAdminToken();
    console.log('Got admin token');
    
    // Prepare the update data
    const updateData = {
      event_title: event.event_title,
      event_desc: event.event_desc,
      event_link: event.event_link,
      event_location: event.event_location,
      event_date: event.event_date,
      event_time: event.event_time,
      event_end_time: "17:00", // Set end time to 5:00 PM
      event_type: event.event_type || "regular",
      ticket_url: event.ticket_url || "",
      user_id: event.user_id
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    // Send update request
    const response = await axios.put(
      `http://localhost:5050/events/update/${eventId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update response:', response.data);
    
    // Check if the update was successful
    if (response.data.success) {
      console.log('Event updated successfully');
      
      // Verify the update in the database
      const updatedEvent = await events_db.collection('events').findOne({ _id: new ObjectId(eventId) });
      
      console.log('\nUpdated Event Details:');
      console.log(`ID: ${updatedEvent._id}`);
      console.log(`Title: ${updatedEvent.event_title}`);
      console.log(`Date: ${updatedEvent.event_date}`);
      console.log(`Start Time: ${updatedEvent.event_time}`);
      console.log(`End Time: ${updatedEvent.event_end_time || 'Not specified'}`);
      
      if (updatedEvent.event_end_time) {
        console.log('\n✅ Success: The event has an end time set to:', updatedEvent.event_end_time);
      } else {
        console.log('\n❌ Issue: The event does not have an end time set after update.');
      }
    } else {
      console.log('Failed to update event');
    }
    
  } catch (error) {
    console.error('Error updating event:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  } finally {
    process.exit(0);
  }
}

updateEventWithEndTime();
