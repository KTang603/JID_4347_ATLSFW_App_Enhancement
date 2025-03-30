import { events_db } from "../db/conn.mjs";

async function checkEventDetails() {
  try {
    // Connect to the database and get all events
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
      console.log(`Description: ${event.event_desc?.substring(0, 50)}...`);
      console.log(`Ticket URL: ${event.ticket_url || 'Not specified'}`);
      console.log(`Participants: ${event.participants?.length || 0}`);
    });
    
  } catch (error) {
    console.error("Error checking event details:", error);
  } finally {
    process.exit(0);
  }
}

checkEventDetails();
