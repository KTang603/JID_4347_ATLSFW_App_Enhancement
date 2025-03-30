import { events_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";

async function checkEventAfterUpdate() {
  try {
    // Get all events
    const events = await events_db.collection('events').find({}).toArray();
    
    console.log(`Found ${events.length} events in the database.`);
    
    // Print details of each event
    events.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`ID: ${event._id}`);
      console.log(`Title: ${event.event_title}`);
      console.log(`Date: ${event.event_date}`);
      console.log(`Start Time: ${event.event_time}`);
      console.log(`End Time: ${event.event_end_time || 'Not specified'}`);
      console.log(`Location: ${event.event_location}`);
      console.log(`Type: ${event.event_type || 'regular'}`);
      
      // Check if event_end_time exists and has a value
      if (event.event_end_time) {
        console.log(`✅ This event has an end time set to: ${event.event_end_time}`);
      } else {
        console.log(`❌ This event does not have an end time set.`);
      }
    });
    
  } catch (error) {
    console.error("Error checking event after update:", error);
  } finally {
    process.exit(0);
  }
}

checkEventAfterUpdate();
