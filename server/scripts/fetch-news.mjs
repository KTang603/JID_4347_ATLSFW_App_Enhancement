import NewsAPI from 'newsapi';
import { posts_db, news_db } from "../db/conn.mjs";

export async function fetchNewsArticles() {
  try {
    // Get API key from database
    const config = await news_db.collection('config').findOne({ type: 'newsapi' });
    if (!config?.apiKey) {
      console.log('NewsAPI key not configured');
      return;
    }

    const newsapi = new NewsAPI(config.apiKey);
    console.log('Starting news article fetch...');
    
    // Get domains from the database
    const domains = await news_db.collection('domains').find({}).toArray();
    // Clean domains to get just the base domain
    const domainList = domains.map(d => {
      try {
        // Remove protocol and path, keep only domain
        const url = new URL(d.domain);
        return url.hostname.replace('www.', '');
      } catch (e) {
        // If URL parsing fails, assume it's already a clean domain
        return d.domain.replace('www.', '');
      }
    }).join(',');
    
    if (!domainList) {
      console.log('No domains configured');
      return;
    }

    console.log('Fetching articles for domains:', domainList);
    console.log('Using search query:', 'sustainability');

    const newsApiArticles = await newsapi.v2.everything({
      q: 'sustainability',
      domains: domainList,
      language: 'en',
      sortBy: 'publishedAt'
    });

    console.log(`Found ${newsApiArticles.articles.length} articles`);

    let addedCount = 0;
    for (const article of newsApiArticles.articles) {
      // Check if article already exists
      const exists = await posts_db.collection('articles').findOne({
        article_link: article.url
      });

      if (!exists) {
        await posts_db.collection('articles').insertOne({
          article_title: article.title,
          article_preview_image: article.urlToImage,
          article_link: article.url,
          author_name: article.author || 'News Source',
          author_id: 'newsapi',
          author_pfp_link: 'default_newsapi_avatar.jpg',
          tags: ['sustainability'],
          like_count: 0,
          save_count: 0,
          source: 'NewsAPI',
          publishDate: new Date(article.publishedAt)
        });
        addedCount++;
      }
    }

    console.log(`Added ${addedCount} new articles`);
    return { addedCount };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
}
