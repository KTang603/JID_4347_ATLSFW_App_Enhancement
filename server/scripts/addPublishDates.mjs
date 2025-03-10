import { posts_db } from "../db/conn.mjs";

async function addDefaultPublishDates() {
  try {
    const collection = posts_db.collection('articles');
    
    // Find articles missing publishDate
    const articlesWithoutDate = await collection.find({
      publishDate: { $exists: false }
    }).toArray();

    for (const article of articlesWithoutDate) {
      // Use ObjectId timestamp or fallback date
      const defaultDate = article._id ? 
        article._id.getTimestamp() : 
        new Date('2024-01-01');

      await collection.updateOne(
        { _id: article._id },
        { $set: { publishDate: defaultDate } }
      );
    }
  } catch (error) {
    console.error('Error adding default publish dates:', error);
  }
}

// Add this to execute the script
addDefaultPublishDates()
  .then(() => console.log('Migration completed'))
  .catch(console.error); 