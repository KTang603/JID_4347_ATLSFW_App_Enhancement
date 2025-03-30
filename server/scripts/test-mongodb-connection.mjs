import { MongoClient } from "mongodb";
import getMongoPasscode from "../password.mjs";

async function testConnection() {
  // Get the connection string
  const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority";
  
  console.log("Testing connection to MongoDB...");
  console.log("Connection string: mongodb+srv://[username]:[password]@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority");
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
    
    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // Create test databases if they don't exist
    console.log("\nCreating test collections in each database...");
    
    // Create users database and test collection
    const usersDb = client.db("users");
    try {
      await usersDb.createCollection("test_connection");
      console.log("✅ Created test collection in users database");
    } catch (e) {
      console.log("Collection already exists in users database");
    }
    
    // Create posts database and test collection
    const postsDb = client.db("posts");
    try {
      await postsDb.createCollection("test_connection");
      console.log("✅ Created test collection in posts database");
    } catch (e) {
      console.log("Collection already exists in posts database");
    }
    
    // Create events database and test collection
    const eventsDb = client.db("events");
    try {
      await eventsDb.createCollection("test_connection");
      console.log("✅ Created test collection in events database");
    } catch (e) {
      console.log("Collection already exists in events database");
    }
    
    // Create news database and test collection
    const newsDb = client.db("news");
    try {
      await newsDb.createCollection("test_connection");
      console.log("✅ Created test collection in news database");
    } catch (e) {
      console.log("Collection already exists in news database");
    }
    
    // Create saved_articles database and test collection
    const savedArticlesDb = client.db("saved_articles");
    try {
      await savedArticlesDb.createCollection("test_connection");
      console.log("✅ Created test collection in saved_articles database");
    } catch (e) {
      console.log("Collection already exists in saved_articles database");
    }
    
    console.log("\n✅ MongoDB connection test completed successfully!");
    console.log("Your application should now be able to connect to the new MongoDB database.");
    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the test
testConnection().catch(console.error);
