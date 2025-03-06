import express from "express";
import cors from "cors";
import "express-async-errors";
import cron from 'node-cron';
import { fetchNewsArticles } from './scripts/fetch-news.mjs';
import signup from "./routes/signup.mjs";
import bodyParser from "body-parser";
import posts from "./routes/posts.mjs";
import login from "./routes/login.mjs";
import vendor from "./routes/vendor.mjs";
import user from "./routes/user.mjs";
import password from "./routes/password.mjs";
import admin from "./routes/admin.mjs";
import news from "./routes/news.mjs";

// Replace the uri string with your MongoDB deployment's connection string.
const API_KEY = 'pub_69919892f87f86c7d48e31dfb61e8e91e0f3b'
const app = express();
const PORT = process.env.PORT || 5050;
app.use(cors());

app.use(bodyParser.json());
// Get a list of 50 posts
app.use('/login', login); // DONE
app.use(signup); //DONE
app.use(posts); 
app.use('/user', user); 
app.use('/vendor', vendor);
app.use('/admin', admin);
app.use('/password', password);
app.use('/news', news);
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occurred.");
});


// Default search query for news
const DEFAULT_SEARCH_QUERY = 'sustainable fashion';

// Schedule news fetch to run once per day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled news fetch...');
  //fetchNewsArticles(DEFAULT_SEARCH_QUERY);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  
  // Also fetch news when server starts
  console.log('Running initial news fetch...');
  //fetchNewsArticles(DEFAULT_SEARCH_QUERY);
});
