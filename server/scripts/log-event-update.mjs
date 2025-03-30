import express from "express";
import bodyParser from "body-parser";
import { events_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";

// Create a simple Express server to log the update request
const app = express();
app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// Route to handle event updates
app.put("/events/update/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`Updating event with ID: ${eventId}`);
    
    const { 
      event_title, 
      event_desc, 
      event_link, 
      event_location, 
      event_date, 
      event_time, 
      event_end_time,
      event_type,
      ticket_url
    } = req.body;
    
    console.log("Received event_end_time:", event_end_time);
    
    // Check if the event exists
    const event = await events_db.collection('events').findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      console.log(`Event with ID ${eventId} not found`);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    console.log("Current event in database:", JSON.stringify(event, null, 2));
    
    // Update the event in the database
    const result = await events_db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      { 
        $set: {
          event_title,
          event_desc,
          event_link,
          event_location,
          event_date,
          event_time,
          event_end_time: event_end_time || "", // Add end time with default empty string
          event_type: event_type || "regular", // Default to regular if not specified
          ticket_url: ticket_url || "", // Add ticket URL field with default empty string
          updated_at: new Date()
        } 
      }
    );
    
    console.log("Update result:", JSON.stringify(result, null, 2));
    
    // Fetch the updated event to verify
    const updatedEvent = await events_db.collection('events').findOne({ _id: new ObjectId(eventId) });
    console.log("Updated event in database:", JSON.stringify(updatedEvent, null, 2));
    
    res.status(200).json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ success: false, message: "Failed to update event", error: err.message });
  }
});

// Start the server
const PORT = 5051; // Use a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Event update logger running on port ${PORT}`);
  console.log(`To test, update an event and point the request to http://localhost:${PORT}/events/update/:id`);
});
