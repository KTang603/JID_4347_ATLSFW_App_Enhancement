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
import event from "./routes/event.mjs";
import home from "./routes/home.mjs";

// Set JWT secret for token generation and validation
process.env.JWT_SECRET = "your-secret-key";

const app = express();
const PORT = process.env.PORT || 5050;
app.use(cors());

app.use(bodyParser.json());

app.use('/login', login);
app.use(signup); 
app.use(posts); 
app.use(event);
app.use('/user', user); 
app.use('/vendor', vendor);
app.use('/admin', admin);
app.use('/password', password);
app.use('/news', news);
app.use('/home', home);

// Global error handler
app.use((err, _req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send("Uh oh! An unexpected error occurred.");
});

// Default search query for news
const DEFAULT_SEARCH_QUERY = 'sustainable fashion';

// Schedule news fetch to run once per day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled news fetch...');
  // News fetching is now handled through the admin interface
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
