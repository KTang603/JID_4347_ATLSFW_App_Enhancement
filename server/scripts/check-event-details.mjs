import { MongoClient } from "mongodb";
import getMongoPasscode from "../password.mjs";

async function checkEventDetails() {
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
    
    // Get all events
    const allEvents = await eventsCollection.find({}).toArray();
    
    console.log(`Found ${allEvents.length} events in the database`);
    
    if (allEvents.length > 0) {
      // Print the structure of the first event
      console.log("\nEvent Structure (first event):");
      console.log(JSON.stringify(allEvents[0], null, 2));
      
      // Check if any events have participants
      const eventsWithParticipants = allEvents.filter(event => 
        event.participants && event.participants.length > 0
      );
      
      console.log(`\n${eventsWithParticipants.length} events have participants`);
      
      if (eventsWithParticipants.length > 0) {
        console.log("\nExample of an event with participants:");
        console.log(JSON.stringify(eventsWithParticipants[0], null, 2));
        
        // Check the structure of participants
        console.log("\nParticipants structure:");
        console.log(eventsWithParticipants[0].participants);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

checkEventDetails();
