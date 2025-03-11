import { posts_db } from "../db/conn.mjs";

async function fixNegativeCounts() {
  try {
    console.log('Starting to fix negative counts...');
    
    // Find all articles with negative counts
    const articles = await posts_db.collection('articles').find({
      $or: [
        { like_count: { $lt: 0 } },
        { save_count: { $lt: 0 } }
      ]
    }).toArray();

    console.log(`Found ${articles.length} articles with negative counts`);

    // Update each article with negative counts
    for (const article of articles) {
      const updates = {};
      if (article.like_count < 0) {
        updates.like_count = 0;
      }
      if (article.save_count < 0) {
        updates.save_count = 0;
      }

      await posts_db.collection('articles').updateOne(
        { _id: article._id },
        { $set: updates }
      );

      console.log(`Fixed counts for article: ${article.article_title}`);
    }

    console.log('Successfully fixed all negative counts');
  } catch (error) {
    console.error('Error fixing negative counts:', error);
  } finally {
    process.exit(0);
  }
}

fixNegativeCounts();
