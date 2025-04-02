import { MongoClient, ObjectId } from "mongodb";
import getMongoPasscode from "../password.mjs";

async function getUserDetails() {
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
    
    // Get the database and collection names
    const dbList = await client.db().admin().listDatabases();
    console.log("Available databases:");
    dbList.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Process each database
    for (const db of dbList.databases) {
      if (db.name === 'admin' || db.name === 'local') continue; // Skip system databases
      
      console.log(`\n========== DATABASE: ${db.name} ==========`);
      const database = client.db(db.name);
      
      // List all collections in the database
      const collections = await database.listCollections().toArray();
      console.log(`\nCollections in '${db.name}' database:`);
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Process each collection
      for (const collection of collections) {
        console.log(`\n---------- COLLECTION: ${collection.name} ----------`);
        const coll = database.collection(collection.name);
        
        // Get count of documents
        const count = await coll.countDocuments();
        console.log(`Document count: ${count}`);
        
        if (count > 0) {
          // Get a sample document to see the structure
          const sampleDoc = await coll.findOne({});
          
          console.log("\nSample document structure:");
          console.log(JSON.stringify(sampleDoc, null, 2));
          
          // List all field names in the document
          console.log("\nDocument fields:");
          const fields = Object.keys(sampleDoc || {});
          fields.forEach(field => {
            console.log(`- ${field}: ${typeof sampleDoc[field]}`);
            
            // If the field is an object or array, show its structure
            if (typeof sampleDoc[field] === 'object' && sampleDoc[field] !== null) {
              console.log(`  Value: ${JSON.stringify(sampleDoc[field])}`);
            } else {
              console.log(`  Value: ${sampleDoc[field]}`);
            }
          });
          
          // Get multiple documents to check for all possible fields
          console.log("\nChecking multiple documents for all fields...");
          const docs = await coll.find({}).limit(5).toArray();
          
          // Create a set of all field names across all documents
          const allFields = new Set();
          docs.forEach(doc => {
            Object.keys(doc).forEach(field => {
              allFields.add(field);
            });
          });
          
          console.log("\nAll fields found across documents:");
          allFields.forEach(field => {
            console.log(`- ${field}`);
          });
          
          // Show unique values for each field (up to 5 examples)
          console.log("\nUnique values for each field (up to 5 examples):");
          for (const field of allFields) {
            const uniqueValues = new Set();
            docs.forEach(doc => {
              if (doc[field] !== undefined) {
                if (typeof doc[field] === 'object') {
                  uniqueValues.add(JSON.stringify(doc[field]));
                } else {
                  uniqueValues.add(doc[field]);
                }
              }
            });
            
            console.log(`- ${field}:`);
            Array.from(uniqueValues).slice(0, 5).forEach(value => {
              console.log(`  * ${value}`);
            });
            
            if (uniqueValues.size > 5) {
              console.log(`  * ... and ${uniqueValues.size - 5} more`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

getUserDetails();
