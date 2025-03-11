import axios from 'axios';
import { posts_db, news_db } from "../db/conn.mjs";

export async function fetchNewsArticles(searchQuery = 'sustainable fashion', apiKey) {
  try {
    if (!apiKey) {
      console.log('NewsData.io API key not provided');
      return;
    }

    console.log('Starting news article fetch...');
    console.log('Search query:', searchQuery);

    // Make request to NewsData.io API
    const url = 'https://newsdata.io/api/1/latest';
    const params = {
      apikey: apiKey,
      q: searchQuery || 'sustainable fashion',
      language: 'en'
    };

    console.log('Making request to:', url);
    const response = await axios.get(url, { params });
    console.log(`Found ${response.data.results?.length || 0} articles`);

    // Save articles to database
    let addedCount = 0;
    for (const article of response.data.results || []) {
      if (!article.title || !article.link) continue;

      try {
        // Create a unique ID based on the article link
        const articleId = Buffer.from(article.link).toString('base64');
        
        await posts_db.collection('articles').insertOne({
          _id: articleId,
          article_title: article.title.trim(),
          article_preview_image: article.image_url,
          article_link: article.link,
          author_name: article.creator?.[0] || 'News Source',
          author_id: 'newsdata',
          author_pfp_link: 'default_newsdata_avatar.jpg',
          tags: [searchQuery || 'sustainable fashion'],
          like_count: 0,
          save_count: 0,
          source: 'NewsData.io',
          publishDate: new Date(article.pubDate),
          createdAt: new Date()
        });
        console.log('Added:', article.title);
        addedCount++;
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate errors
          console.error('Error saving article:', error);
        }
      }
    }

    console.log(`Added ${addedCount} new articles`);
    return { addedCount };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
}
