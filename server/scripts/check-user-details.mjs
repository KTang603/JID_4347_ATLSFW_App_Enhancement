import { MongoClient, ObjectId } from "mongodb";
import getMongoPasscode from "../password.mjs";

async function checkUserDetails() {
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
    
    // Get the users collection
    const usersDb = client.db("users");
    const usersCollection = usersDb.collection("customer_info");
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const username = args[0] || "test_email"; // Default to "test_email" if no username provided
    
    console.log(`Searching for user with username: ${username}`);
    
    // Find user by username
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      console.log(`No user found with username: ${username}`);
      return;
    }
    
    console.log("User found:");
    console.log(JSON.stringify(user, null, 2));
    
    // List all fields in the user document
    console.log("\nUser fields:");
    Object.keys(user).forEach(field => {
      console.log(`- ${field}: ${typeof user[field] === 'object' ? JSON.stringify(user[field]) : user[field]}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

checkUserDetails();
