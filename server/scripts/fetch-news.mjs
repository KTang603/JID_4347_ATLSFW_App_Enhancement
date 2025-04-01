import axios from 'axios';
import { posts_db, news_db,third_party_db } from "../db/conn.mjs";

const NEWS_CATEGORY = 'business,entertainment,lifestyle,sports,top';
const NEWS_LANGUAGE = 'en';
const SEARCH_QUERY = 'fashion';

export async function fetchNewsArticles(debug = true) {
  try {
    const NewsDataConfig = await third_party_db.collection('config').findOne();
    if (!NewsDataConfig.api_key) {
      return null;
    }
    const news_url = `https://newsdata.io/api/1/latest?apikey=${NewsDataConfig.api_key}&q=${SEARCH_QUERY}&language=${NEWS_LANGUAGE}&category=${NEWS_CATEGORY}`;

    debug && console.log('Making request to:', news_url);
    const response = await axios.get(news_url);
    // Save articles to database
    let addedCount = 0;
    let duplicateCount = 0;
    debug && console.log(`Processing ${response.data.results?.length || 0} articles from API`);
    for (const article of response.data.results || []) {
      // if (!article.title || !article.link) continue;
      try {     
       const articlesDb = await posts_db.collection('articles')
       // Check for duplicates by article_id or title
       const existArticles = await articlesDb.findOne({
         $or: [
           {news_data_article_id: article.article_id},
           {article_title: article.title.trim()}
         ]
       });
       const isExist = existArticles ? true : false
       
       if (debug) {
         console.log(`Article: "${article.title.trim().substring(0, 30)}..."`);
         console.log(`  ID: ${article.article_id}`);
         console.log(`  Exists: ${isExist}`);
         if (isExist) {
           console.log(`  Matched by: ${existArticles.news_data_article_id === article.article_id ? 'article_id' : 'title'}`);
         }
       }
       
       if(!isExist){
          await posts_db.collection('articles').insertOne({
          news_data_article_id:article.article_id,
          article_title: article.title.trim(),
          article_preview_image: article.image_url,
          article_link: article.link,
          author_name: article.creator?.[0] || 'News Source',
          author_id: `newsdata@${article.article_id}`,
          author_pfp_link: 'default_newsdata_avatar.jpg',
          tags: [article.category[0]],
          like_count: 0,
          save_count: 0,
          source: 'NewsData.io',
          publishDate: new Date(article.pubDate),
          createdAt: new Date()
        });
        addedCount++;
        debug && console.log(`  Added to database`);
      } else {
        duplicateCount++;
        debug && console.log(`  Skipped as duplicate`);
      }
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate errors
          console.error('Error saving article:', error);
        }
      }
    }

    debug && console.log(`Finished processing articles. Added: ${addedCount}, Skipped duplicates: ${duplicateCount}`);
    return { addedCount, duplicateCount };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
}
