import express from "express";
import { posts_db, users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import tagsList from "../utils/tagsList.mjs";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// Middleware to verify token for protected routes
//ADMIN
router.use(['/posts/create', '/posts/delete', '/posts/update'], verifyToken);


router.get("/tags", verifyToken, async (req, res) => {
  //read from DB
  res.status(200).json(tagsList);
});

// Admin only - Create article
router.post("/posts/create", requireAdmin, async (req, res) => {
  const { article_title, article_preview_image, article_link, author_id, author_name, author_pfp_link, tags, source } = req.body;
  if (!article_title || !article_link || !author_id || !author_name) {
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
      source: source || 'Manual',
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; 

    // Extracting query parameters
    const tagsQuery = req.query.tags;
    // const searchQuery = req.query.search;
    // const sourceQuery = req.query.source;
    // const sortBy = req.query.sortBy || 'publishDate';
    // const order = req.query.order === 'asc' ? 1 : -1;

    // Build query
    let query = {};

    // Source filter
    // if (sourceQuery) {
    //   query.source = sourceQuery;
    // }
    
    // Tags filter
    if (tagsQuery) {
      const tags = tagsQuery.split(",");
      query.tags = { $in: tags };
    }

    // Search filter
    // if (searchQuery) {
    //   query.$or = [
    //     { article_title: { $regex: searchQuery, $options: 'i' } },
    //     { author_name: { $regex: searchQuery, $options: 'i' } }
    //   ];
    // }

    const collection = posts_db.collection('articles');
   
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    

    // Get paginated results
    const articles = await collection
      .find(query)
      // .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Ensure no negative counts
    // for (let article of articles) {
    //   if (article.like_count < 0) article.like_count = 0;
    //   if (article.save_count < 0) article.save_count = 0;
    // }

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
      .limit(10)
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
      .limit(10)
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
      return res.status(404).json({ success: false, message: "Article not found!" });
    }

    // Check if article exists - try both ObjectId and string ID
    let articleExists;
    if (ObjectId.isValid(article_id)) {
      articleExists = await posts_db.collection("articles").findOne({ _id: new ObjectId(article_id) });
    }
    if (!articleExists) {
      articleExists = await posts_db.collection("articles").findOne({ _id: article_id });
    }
    if (!articleExists) {
      return res.status(404).json({ success: false, message: "Article not found!" });
    }

    let arg;
    let update;
    let articles;

    console.log('Request details:', {
      article_id,
      user_id,
      query: req.query,
      body: req.body
    });

    // Debug logging
    console.log('Request body:', req.body);

    // Validate query parameters
    if (req.query.like) {
      arg = parseInt(req.query.like);
      if (arg !== 1 && arg !== -1) {
        console.error('Invalid like value:', arg);
        return res.status(400).json({ success: false, message: "Invalid like value" });
      }

      // Validate and process liked_articles
      const { liked_articles } = req.body;
      if (!liked_articles) {
        console.error('Missing liked_articles in request body');
        return res.status(400).json({ success: false, message: "liked_articles is required" });
      }
      if (!Array.isArray(liked_articles)) {
        console.error('Invalid liked_articles:', liked_articles);
        return res.status(400).json({ success: false, message: "liked_articles must be an array" });
      }

      // Convert all IDs to strings and filter out invalid values
      articles = liked_articles
        .filter(id => id != null)
        .map(id => id.toString());

      // Debug logging
      console.log('Processed liked_articles:', articles);

      update = { $set: { liked_articles: articles } };
    } else if (req.query.save) {
      arg = parseInt(req.query.save);
      if (arg !== 1 && arg !== -1) {
        console.error('Invalid save value:', arg);
        return res.status(400).json({ success: false, message: "Invalid save value" });
      }
      const { saved_articles } = req.body;
      if (!Array.isArray(saved_articles)) {
        console.error('Invalid saved_articles:', saved_articles);
        return res.status(400).json({ success: false, message: "saved_articles must be an array" });
      }
      articles = saved_articles.map(id => id.toString());
      update = { $set: { saved_articles: articles }}
    }

    if (!update) {
      console.error('Missing action in request');
      return res.status(400).json({ success: false, message: "Missing or invalid action" });
    }

    console.log('Processing update:', {
      user_id,
      action: req.query.like ? 'like' : 'save',
      arg,
      articles,
      update
    });

    // Debug logging
    console.log('Processing update:', {
      user_id,
      action: req.query.like ? 'like' : 'save',
      articles,
      update
    });

    // Keep all article IDs as strings
    const validArticles = articles.filter(id => id && typeof id === 'string');
    
    // Update with string IDs
    if (req.query.like) {
      update = { $set: { liked_articles: validArticles } };
    } else if (req.query.save) {
      update = { $set: { saved_articles: validArticles } };
    }

    // Debug logging
    console.log('Updating user articles:', {
      user_id,
      action: req.query.like ? 'like' : 'save',
      validArticles,
      update
    });

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
        try {
          // Get current like count
          // Try both ObjectId and string ID
          let article;
          if (ObjectId.isValid(article_id)) {
            article = await posts_db.collection("articles").findOne({ _id: new ObjectId(article_id) });
          }
          if (!article) {
            article = await posts_db.collection("articles").findOne({ _id: article_id });
          }

          if (!article) {
            console.error('Article not found:', article_id);
            return res.status(404).json({ success: false, message: "Article not found!" });
          }

          // Debug logging
          console.log('Current article state:', {
            article_id,
            current_like_count: article.like_count,
            arg
          });

          let newLikeCount = article.like_count + arg;
          // Ensure count doesn't go below 0
          newLikeCount = Math.max(0, newLikeCount);

          // Debug logging
          console.log('Updating like count:', {
            article_id,
            old_count: article.like_count,
            new_count: newLikeCount
          });

          // Update using the correct ID type
          const query = ObjectId.isValid(article_id) ? 
            { _id: new ObjectId(article_id) } : 
            { _id: article_id };
            
          const likeResult = await posts_db.collection("articles").updateOne(
            query,
            { $set: { like_count: newLikeCount } }
          );

          if (!likeResult.modifiedCount) {
            console.error('Like update failed:', {
              article_id,
              result: likeResult
            });
            return res.status(400).json({ success: false, message: "Like action unsuccessful!" });
          }

          // Debug logging
          console.log('Like update successful:', {
            article_id,
            new_count: newLikeCount
          });
        } catch (error) {
          console.error('Error updating like count:', error);
          return res.status(500).json({ success: false, message: "Error updating like count" });
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
        // Try both ObjectId and string ID
        let article;
        if (ObjectId.isValid(article_id)) {
          article = await posts_db.collection("articles").findOne({ _id: new ObjectId(article_id) });
        }
        if (!article) {
          article = await posts_db.collection("articles").findOne({ _id: article_id });
        }

        let newSaveCount = article.save_count + arg;
        // Ensure count doesn't go below 0
        newSaveCount = Math.max(0, newSaveCount);

        // Update using the correct ID type
        const query = ObjectId.isValid(article_id) ? 
          { _id: new ObjectId(article_id) } : 
          { _id: article_id };
          
        const saveResult = await posts_db.collection("articles").updateOne(
          query,
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
