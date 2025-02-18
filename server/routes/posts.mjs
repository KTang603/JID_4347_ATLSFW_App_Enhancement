import express from "express";
import { posts_db, users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import tagsList from "../utils/tagsList.mjs";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import axios from "axios";
import dummy_data from "../articles.mjs"; 

const router = express.Router();

let externalArticlesCache = [];
let lastExternalFetch = 0;
const ONE_HOUR = 3600000;

// Middleware to verify token for protected routes
router.use(['/posts/create', '/posts/delete', '/posts/update'], verifyToken);

router.get("/tags", verifyToken, async (req, res) => {
  res.status(200).json(tagsList);
});

// Admin only - Create article
router.post("/posts/create", requireAdmin, async (req, res) => {
  const { article_title, article_preview_image, article_link, author_id, author_name, author_pfp_link, tags } = req.body;
  if (!article_title || !article_link || !article_preview_image || !author_id || !author_name || !author_pfp_link) {
      return res.status(400).json({ success: false, message: 'Missing article information' });
  }
  try {
    await posts_db.collection('articles').insertOne({
      article_title,
      article_preview_image,
      article_link,
      author_id,
      author_name,
      author_pfp_link,
      tags,
      like_count: 0,
      save_count: 0,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


// Get articles with pagination and filtering
router.get("/posts", verifyToken, async (req, res) => {
  try {
    console.log("LOL")
    const page = parseInt(req.query.page) || 1;
    console.log(page)
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extracting query parameters
    const tagsQuery = req.query.tags;
    const searchQuery = req.query.search;
    const sortBy = req.query.sortBy || 'publishDate';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Build query
    let query = {};
    
    // Tags filter
    if (tagsQuery) {
      const tags = tagsQuery.split(",");
      query.tags = { $in: tags };
    }

    // Search filter
    if (searchQuery) {
      query.$or = [
        { article_title: { $regex: searchQuery, $options: 'i' } },
        { author_name: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const collection = posts_db.collection('articles');

    // Get total count for pagination
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const localArticles = await collection
      .find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Ensure no negative counts
    for (let article of localArticles) {
      if (article.like_count < 0) article.like_count = 0;
      if (article.save_count < 0) article.save_count = 0;
    }

    // Function to transform external API's article format to our local schema
    const transformExternalArticle = (extArticle) => ({
      // Use the external title, link, and image URL to match our schema
      article_title: extArticle.title,
      article_preview_image: extArticle.image_url || "",
      article_link: extArticle.link,
      author_id: extArticle.source_id || "newsdata-api",
      author_name: extArticle.source_name || "NewsData.io",
      author_pfp_link: extArticle.source_icon || "",
      tags: extArticle.category
        ? (Array.isArray(extArticle.category) ? extArticle.category : [extArticle.category])
        : [],
      like_count: 0,
      save_count: 0,
      publishDate: extArticle.pubDate || null
    });

    const now = Date.now();
    console.log(now)

    if (!lastExternalFetch || (now - lastExternalFetch > ONE_HOUR)) {
      try {
        const apiKey = "pub_69804b95b65400647becb636fdb62f1390496";
        const newsApiUrl = "https://newsdata.io/api/1/latest";
        const response = await axios.get(newsApiUrl, {
          params: {
            apikey: apiKey,
            qInTitle: "fashion",
            language: "en",
          }
        });
        if (response.data && Array.isArray(response.data.results)) {
          externalArticlesCache = response.data.results.map(transformExternalArticle);
          lastExternalFetch = now;
          console.log("External articles refreshed.");
        }
      } catch (externalErr) {
        console.error("Error fetching external news:", externalErr.message);
      }
    }

    const externalArticles = externalArticlesCache;
    
    if (externalArticles.length > 0) {
      try {
        // UNCOMMENT THE NEXT LINE TO SAVE NEWS DATA API ARTICLES TO MONGODB
        //await posts_db.collection('articles').insertMany(externalArticles);

        //UNCOMMENT NEXT 2 LINES TO INSERT DUMMY DATA INTO DB
        ///const articlesToInsert = dummy_data.articles.map((item) => item.article);
        //const result = await posts_db.collection('articles').insertMany(articlesToInsert);
        console.log("external articles saved")
      } catch (insertErr) {
        console.error("Error inserting external articles:", insertErr.message);
      }
    }

    const articles = localArticles.concat(externalArticles)

    console.log(localArticles)

    res.status(200).json({
      articles,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/posts/top_liked", async (req, res) => {
  try {
    const collection = posts_db.collection('articles');
    const top_liked = await collection.find({})
      .sort({ like_count: -1 })
      .limit(3)
      .toArray();

    // Ensure no negative counts
    for (let article of top_liked) {
      if (article.like_count < 0) article.like_count = 0;
    }

    res.status(200).json(top_liked);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/posts/top_saved", async (req, res) => {
  try {
    const collection = posts_db.collection('articles');
    const top_saved = await collection.find({})
      .sort({ save_count: -1 })
      .limit(3)
      .toArray();

    // Ensure no negative counts
    for (let article of top_saved) {
      if (article.save_count < 0) article.save_count = 0;
    }

    res.status(200).json(top_saved);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Admin only - Update article
router.put("/posts/:article_id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { article_id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.like_count;
    delete updateData.save_count;

    const result = await posts_db.collection('articles').updateOne(
      { _id: new ObjectId(article_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ success: true, message: 'Article updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Admin only - Delete article
router.delete("/posts/:article_id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { article_id } = req.params;
    
    const result = await posts_db.collection('articles').deleteOne({
      _id: new ObjectId(article_id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Remove article references from users' liked and saved articles
    await users_db.collection("customer_info").updateMany(
      {},
      {
        $pull: {
          liked_articles: article_id,
          saved_articles: article_id
        }
      }
    );

    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Protected route for user interactions
router.post('/posts/:article_id/', verifyToken, async (req, res) => {
  try {
    const { article_id } = req.params;
    const user_id = req.user.id;
    if (!article_id) {
      return res.status(404).send({ message: "Article not found!" });
    }

    let arg;
    let update;
    let articles;
    if (req.query.like) {
      arg = parseInt(req.query.like);
      const { liked_articles } = req.body;
      articles = liked_articles;
      update = { $set: { liked_articles: liked_articles } }
    } else if (req.query.save) {
      arg = parseInt(req.query.save);
      const { saved_articles } = req.body;
      articles = saved_articles;
      update = { $set: { saved_articles: saved_articles }}
    }

    if (!update) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    // Update user's liked/saved articles
    const userResult = await users_db.collection("customer_info").updateOne(
      { _id: new ObjectId(user_id) },
      update
    );

    if (!userResult.modifiedCount) {
      return res.status(400).json({ success: false, message: "Article update failed!" });
    }

    // Handle like action
    if (req.query.like) {
      if (arg && (arg === 1 || arg === -1)) {
        // Get current like count
        const article = await posts_db.collection("articles").findOne(
          { _id: new ObjectId(article_id) }
        );

        let newLikeCount = article.like_count + arg;
        // Ensure count doesn't go below 0
        newLikeCount = Math.max(0, newLikeCount);

        const likeResult = await posts_db.collection("articles").updateOne(
          { _id: new ObjectId(article_id) },
          { $set: { like_count: newLikeCount } }
        );

        if (!likeResult.modifiedCount) {
          return res.status(400).json({ success: false, message: "Like action unsuccessful!" });
        }
      } else {
        return res.status(400).json({ success: false, message: "Invalid like query!" });
      }
      return res.status(200).json({ success: true });
    }

    // Handle save action
    if (req.query.save) {
      if (arg && (arg === 1 || arg === -1)) {
        // Get current save count
        const article = await posts_db.collection("articles").findOne(
          { _id: new ObjectId(article_id) }
        );

        let newSaveCount = article.save_count + arg;
        // Ensure count doesn't go below 0
        newSaveCount = Math.max(0, newSaveCount);

        const saveResult = await posts_db.collection("articles").updateOne(
          { _id: new ObjectId(article_id) },
          { $set: { save_count: newSaveCount } }
        );

        if (!saveResult.modifiedCount) {
          return res.status(400).json({ success: false, message: "Save action unsuccessful!" });
        }
      } else {
        return res.status(400).json({ success: false, message: "Invalid save query!" });
      }
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;