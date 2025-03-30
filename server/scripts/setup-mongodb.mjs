// MongoDB Database Setup Script
import { MongoClient } from 'mongodb';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for connection string if not provided
function promptForConnectionString() {
  return new Promise((resolve) => {
    console.log('\n=== MongoDB Setup Script ===');
    console.log('This script will create the database structure for the ATLSFW App.');
    console.log('Please provide your MongoDB Atlas connection string:');
    console.log('(You can find this in the MongoDB Atlas dashboard by clicking "Connect" -> "Connect your application")');
    
    rl.question('Connection String: ', (connectionString) => {
      resolve({ connectionString });
    });
  });
}

// Main function to set up MongoDB
async function setupMongoDB(connectionString) {
  // Use the provided connection string directly
  const uri = connectionString;
  
  console.log(`Attempting to connect with provided connection string...`);
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    console.log('\nConnecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');

    // Create databases and collections
    await createDatabases(client);
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nYou can now update your application to use this MongoDB instance.');
    console.log('Make sure to update the connection string in your application.');
    
  } catch (error) {
    console.error('\n❌ Error setting up MongoDB:', error);
    console.log('\nPlease check your credentials and try again.');
  } finally {
    await client.close();
    rl.close();
  }
}

// Function to create all databases and collections
async function createDatabases(client) {
  console.log('\nCreating databases and collections...');
  
  // 1. users_db
  const users_db = client.db('users');
  console.log('Creating users_db...');
  
  // Create collections
  await users_db.createCollection('customer_info');
  await users_db.createCollection('user_login');
  await users_db.createCollection('vendor_info');
  
  // Create indexes
  await users_db.collection('customer_info').createIndex({ hashed_email: 1 }, { unique: true });
  await users_db.collection('customer_info').createIndex({ user_email: 1 }, { unique: true });
  await users_db.collection('customer_info').createIndex({ username: 1 }, { unique: true });
  await users_db.collection('user_login').createIndex({ hashed_email: 1 }, { unique: true });
  await users_db.collection('vendor_info').createIndex({ vendor_id: 1 }, { unique: true });
  
  console.log('✅ users_db created with collections and indexes');
  
  // 2. posts_db
  const posts_db = client.db('posts');
  console.log('Creating posts_db...');
  
  // Create collections
  await posts_db.createCollection('articles');
  await posts_db.createCollection('liked_articles');
  await posts_db.createCollection('saved_articles');
  
  // Create indexes
  await posts_db.collection('articles').createIndex({ tags: 1 });
  await posts_db.collection('articles').createIndex({ createdAt: -1 });
  await posts_db.collection('liked_articles').createIndex({ article_id: 1, user_id: 1 }, { unique: true });
  await posts_db.collection('saved_articles').createIndex({ article_id: 1, user_id: 1 }, { unique: true });
  
  console.log('✅ posts_db created with collections and indexes');
  
  // 3. events_db
  const events_db = client.db('events');
  console.log('Creating events_db...');
  
  // Create collections
  await events_db.createCollection('events');
  
  // Create indexes
  await events_db.collection('events').createIndex({ event_date: 1 });
  await events_db.collection('events').createIndex({ event_type: 1 });
  await events_db.collection('events').createIndex({ user_id: 1 });
  
  console.log('✅ events_db created with collections and indexes');
  
  // 4. news_db
  const news_db = client.db('news');
  console.log('Creating news_db...');
  
  // Create collections
  await news_db.createCollection('config');
  
  // Create indexes
  await news_db.collection('config').createIndex({ type: 1 }, { unique: true });
  
  console.log('✅ news_db created with collections and indexes');
  
  // 5. saved_articles_db
  const saved_articles_db = client.db('saved_articles');
  console.log('Creating saved_articles_db...');
  
  // This DB might not have specific collections, but we'll create a placeholder
  await saved_articles_db.createCollection('saved_articles_data');
  
  console.log('✅ saved_articles_db created');
}

// Check if connection string is provided as a command-line argument
const args = process.argv.slice(2);
if (args.length >= 1) {
  const connectionString = args[0];
  setupMongoDB(connectionString);
} else {
  // Prompt for connection string
  promptForConnectionString().then(({ connectionString }) => {
    setupMongoDB(connectionString);
  });
}
