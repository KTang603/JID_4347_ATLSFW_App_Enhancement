import { posts_db } from "../db/conn.mjs";

async function cleanDuplicateArticles() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find all news API articles (both old and new source names)
    const articles = await posts_db.collection('articles')
      .find({ 
        $or: [
          { source: 'NewsData.io' },
          { source: 'NewsAPI' }
        ]
      })
      .toArray();

    console.log(`Found ${articles.length} news API articles`);

    // Group articles by normalized title
    const groupedArticles = {};
    articles.forEach(article => {
      const normalizedTitle = article.article_title.trim().toLowerCase();
      if (!groupedArticles[normalizedTitle]) {
        groupedArticles[normalizedTitle] = [];
      }
      groupedArticles[normalizedTitle].push(article);
    });

    // Find groups with more than one article (duplicates)
    let duplicatesRemoved = 0;
    for (const [title, group] of Object.entries(groupedArticles)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} duplicates for title: ${title}`);
        
        // Keep the first article, remove the rest
        const [keep, ...remove] = group;
        const removeIds = remove.map(article => article._id);
        
        const result = await posts_db.collection('articles')
          .deleteMany({ _id: { $in: removeIds } });
        
        duplicatesRemoved += result.deletedCount;
        console.log(`Removed ${result.deletedCount} duplicate articles`);
      }
    }

    console.log(`Total duplicates removed: ${duplicatesRemoved}`);
  } catch (error) {
    console.error('Error cleaning duplicate articles:', error);
  }
}

cleanDuplicateArticles().catch(console.error);
