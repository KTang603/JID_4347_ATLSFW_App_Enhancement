import { MongoClient } from "mongodb";
import getMongoPasscode from "../password.mjs";

async function checkEventType() {
  const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.buqut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
    retryWrites: true,
    w: 'majority'
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const eventsDb = client.db("events");
    const eventsCollection = eventsDb.collection("events");
    
    // Find the specific event
    const event = await eventsCollection.findOne({ 
      event_title: "testing_a" 
    });
    
    console.log("\n=== SPECIFIC EVENT ===");
    if (event) {
      console.log("Event found:");
      console.log("Title:", event.event_title);
      console.log("Type:", event.event_type || "Not specified (defaults to regular)");
      console.log("Date:", event.event_date);
      console.log("Location:", event.event_location);
      console.log("\nFull event object:");
      console.log(JSON.stringify(event, null, 2));
    } else {
      console.log("Event not found with exact title 'testing_a'");
    }
    
    // Get all events to check if any have event_type set
    console.log("\n=== ALL EVENTS ===");
    const allEvents = await eventsCollection.find({}).toArray();
    
    console.log(`Found ${allEvents.length} total events`);
    console.log("Events with event_type set:");
    
    let hasEventTypeCount = 0;
    
    allEvents.forEach(event => {
      if (event.event_type) {
        hasEventTypeCount++;
        console.log(`\nTitle: ${event.event_title}`);
        console.log(`Type: ${event.event_type}`);
        console.log(`Date: ${event.event_date}`);
        console.log(`Created at: ${event.created_at}`);
        console.log("---");
      }
    });
    
    console.log(`\n${hasEventTypeCount} out of ${allEvents.length} events have event_type set`);
    
    // Check for similar events
    console.log("\n=== SIMILAR EVENTS ===");
    const similarEvents = await eventsCollection.find({ 
      event_title: { $regex: "testing", $options: "i" } 
    }).toArray();
    
    if (similarEvents.length > 0) {
      console.log(`Found ${similarEvents.length} similar events:`);
      similarEvents.forEach(event => {
        console.log(`\nTitle: ${event.event_title}`);
        console.log(`Type: ${event.event_type || "Not specified (defaults to regular)"}`);
        console.log(`Date: ${event.event_date}`);
        console.log(`Location: ${event.event_location}`);
        console.log(`Full object: ${JSON.stringify(event, null, 2)}`);
        console.log("---");
      });
    } else {
      console.log("No similar events found.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

checkEventType();
