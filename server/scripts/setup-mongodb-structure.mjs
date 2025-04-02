import { MongoClient } from 'mongodb';
import getMongoPasscode from '../password.mjs';

async function setupMongoDBStructure() {
  // Get the connection string
  const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority";
  
  console.log("Setting up MongoDB database structure...");
  console.log("Using connection string: mongodb+srv://[username]:[password]@cluster0.k4tdfvm.mongodb.net/?retryWrites=true&w=majority");
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
    
    // Create databases and collections
    await setupDatabases(client);
    
    console.log("\n✅ MongoDB database structure setup completed successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up MongoDB structure:", error);
  } finally {
    // Close the connection
    await client.close();
  }
}

async function setupDatabases(client) {
  console.log("\n=== Setting up databases and collections ===");
  
  // 1. Set up users_db
  console.log("\n--- Setting up users database ---");
  const usersDb = client.db("users");
  
  // Create collections
  console.log("Creating collections in users database...");
  try {
    await usersDb.createCollection("customer_info");
    console.log("✅ Created customer_info collection");
  } catch (e) {
    console.log("Collection customer_info already exists");
  }
  
  try {
    await usersDb.createCollection("user_login");
    console.log("✅ Created user_login collection");
  } catch (e) {
    console.log("Collection user_login already exists");
  }
  
  try {
    await usersDb.createCollection("vendor_info");
    console.log("✅ Created vendor_info collection");
  } catch (e) {
    console.log("Collection vendor_info already exists");
  }
  
  // Create indexes
  console.log("\nCreating indexes in users database...");
  try {
    await usersDb.collection("customer_info").createIndex({ "hashed_email": 1 }, { unique: true });
    console.log("✅ Created index on hashed_email in customer_info collection");
  } catch (e) {
    console.log("Index on hashed_email in customer_info collection already exists or failed:", e.message);
  }
  
  try {
    await usersDb.collection("customer_info").createIndex({ "user_email": 1 }, { unique: true });
    console.log("✅ Created index on user_email in customer_info collection");
  } catch (e) {
    console.log("Index on user_email in customer_info collection already exists or failed:", e.message);
  }
  
  try {
    await usersDb.collection("customer_info").createIndex({ "username": 1 }, { unique: true });
    console.log("✅ Created index on username in customer_info collection");
  } catch (e) {
    console.log("Index on username in customer_info collection already exists or failed:", e.message);
  }
  
  try {
    await usersDb.collection("user_login").createIndex({ "hashed_email": 1 }, { unique: true });
    console.log("✅ Created index on hashed_email in user_login collection");
  } catch (e) {
    console.log("Index on hashed_email in user_login collection already exists or failed:", e.message);
  }
  
  try {
    await usersDb.collection("vendor_info").createIndex({ "vendor_id": 1 }, { unique: true });
    console.log("✅ Created index on vendor_id in vendor_info collection");
  } catch (e) {
    console.log("Index on vendor_id in vendor_info collection already exists or failed:", e.message);
  }
  
  // 2. Set up posts_db
  console.log("\n--- Setting up posts database ---");
  const postsDb = client.db("posts");
  
  // Create collections
  console.log("Creating collections in posts database...");
  try {
    await postsDb.createCollection("articles");
    console.log("✅ Created articles collection");
  } catch (e) {
    console.log("Collection articles already exists");
  }
  
  try {
    await postsDb.createCollection("liked_articles");
    console.log("✅ Created liked_articles collection");
  } catch (e) {
    console.log("Collection liked_articles already exists");
  }
  
  try {
    await postsDb.createCollection("saved_articles");
    console.log("✅ Created saved_articles collection");
  } catch (e) {
    console.log("Collection saved_articles already exists");
  }
  
  // Create indexes
  console.log("\nCreating indexes in posts database...");
  try {
    await postsDb.collection("articles").createIndex({ "tags": 1 });
    console.log("✅ Created index on tags in articles collection");
  } catch (e) {
    console.log("Index on tags in articles collection already exists or failed:", e.message);
  }
  
  try {
    await postsDb.collection("articles").createIndex({ "createdAt": -1 });
    console.log("✅ Created index on createdAt in articles collection");
  } catch (e) {
    console.log("Index on createdAt in articles collection already exists or failed:", e.message);
  }
  
  try {
    await postsDb.collection("liked_articles").createIndex({ "article_id": 1, "user_id": 1 }, { unique: true });
    console.log("✅ Created compound index on article_id and user_id in liked_articles collection");
  } catch (e) {
    console.log("Compound index on article_id and user_id in liked_articles collection already exists or failed:", e.message);
  }
  
  try {
    await postsDb.collection("saved_articles").createIndex({ "article_id": 1, "user_id": 1 }, { unique: true });
    console.log("✅ Created compound index on article_id and user_id in saved_articles collection");
  } catch (e) {
    console.log("Compound index on article_id and user_id in saved_articles collection already exists or failed:", e.message);
  }
  
  // 3. Set up events_db
  console.log("\n--- Setting up events database ---");
  const eventsDb = client.db("events");
  
  // Create collections
  console.log("Creating collections in events database...");
  try {
    await eventsDb.createCollection("events");
    console.log("✅ Created events collection");
  } catch (e) {
    console.log("Collection events already exists");
  }
  
  // Create indexes
  console.log("\nCreating indexes in events database...");
  try {
    await eventsDb.collection("events").createIndex({ "event_date": 1 });
    console.log("✅ Created index on event_date in events collection");
  } catch (e) {
    console.log("Index on event_date in events collection already exists or failed:", e.message);
  }
  
  try {
    await eventsDb.collection("events").createIndex({ "event_type": 1 });
    console.log("✅ Created index on event_type in events collection");
  } catch (e) {
    console.log("Index on event_type in events collection already exists or failed:", e.message);
  }
  
  try {
    await eventsDb.collection("events").createIndex({ "user_id": 1 });
    console.log("✅ Created index on user_id in events collection");
  } catch (e) {
    console.log("Index on user_id in events collection already exists or failed:", e.message);
  }
  
  // 4. Set up news_db
  console.log("\n--- Setting up news database ---");
  const newsDb = client.db("news");
  
  // Create collections
  console.log("Creating collections in news database...");
  try {
    await newsDb.createCollection("config");
    console.log("✅ Created config collection");
  } catch (e) {
    console.log("Collection config already exists");
  }
  
  // Create indexes
  console.log("\nCreating indexes in news database...");
  try {
    await newsDb.collection("config").createIndex({ "type": 1 }, { unique: true });
    console.log("✅ Created index on type in config collection");
  } catch (e) {
    console.log("Index on type in config collection already exists or failed:", e.message);
  }
  
  // 5. Set up saved_articles_db
  console.log("\n--- Setting up saved_articles database ---");
  const savedArticlesDb = client.db("saved_articles");
  
  // Create collections
  console.log("Creating collections in saved_articles database...");
  try {
    await savedArticlesDb.createCollection("saved_articles_data");
    console.log("✅ Created saved_articles_data collection");
  } catch (e) {
    console.log("Collection saved_articles_data already exists");
  }
  
  console.log("\n✅ All databases, collections, and indexes have been set up successfully!");
}

// Run the setup
setupMongoDBStructure().catch(console.error);
