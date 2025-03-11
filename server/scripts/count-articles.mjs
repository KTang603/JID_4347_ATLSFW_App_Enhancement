import { posts_db } from "../db/conn.mjs";

async function countArticles() {
  try {
    const count = await posts_db.collection('articles').countDocuments();
    console.log(`Total articles in database: ${count}`);
  } catch (error) {
    console.error('Error counting articles:', error);
  }
}

countArticles();
