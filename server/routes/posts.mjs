import express from "express";
import { posts_db, users_db,saved_articles_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import tagsList from "../utils/tagsList.mjs";
import { verifyToken, requireAdmin, checkUserStatus } from "../middleware/auth.mjs";

const router = express.Router();

// Middleware to verify token for protected routes
//ADMIN
router.use(['/posts/create', '/posts/delete', '/posts/update'], verifyToken);


router.get("/tags", verifyToken, async (req, res) => {
  //read from DB
  res.status(200).json(tagsList);
});

// Admin only - Create article
router.post("/posts/create", requireAdmin,checkUserStatus, async (req, res) => {
  const { article_title, article_preview_image, article_link, author_id, author_name, article_description, tags, source } = req.body;
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
      article_description,
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
router.get("/posts", verifyToken,checkUserStatus, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; 
    // Extracting query parameters
    let tagsQuery = req.query.tags;
    // const searchQuery = req.query.search;
    // const sourceQuery = req.query.source;
    // const sortBy = req.query.sortBy || 'publishDate';

    // Build query
    let query = {};
    let order = 1;

     if(tagsQuery){
    order = tagsQuery.includes('Latest') ? -1 : 1
    tagsQuery = tagsQuery.includes('Latest') && tagsQuery.replace('Latest',"");
     }
    // Tags filter
    if (tagsQuery) {
      let tags = tagsQuery.split(",");
      tags = tags.filter(tag => tag.length > 0);
      query.tags = { $in: tags };
    }

    const collection = posts_db.collection('articles');
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const articles = await collection
      .find(query)
      .sort({ ['createdAt']: order })
      .skip(skip)
      .limit(limit)
      .toArray();


      let updated_articles = [];
      for(let article of articles){

        const saved_articles = await posts_db.collection('saved_articles').find({
          article_id: article._id.toString()
        }).toArray();
        
        const liked_articles = await posts_db.collection('liked_articles').find({
          article_id: article._id.toString()
        }).toArray();

        const articles_exist = await posts_db.collection('saved_articles').find({
          article_id: article._id.toString(), user_id: req.user.id
        }).toArray();

        const liked_exist = await posts_db.collection('liked_articles').find({
          article_id: article._id.toString(), user_id: req.user.id
        }).toArray();


        const like_count = liked_articles.length;
        const is_liked = liked_exist.length;

        const save_count = saved_articles.length;
        const is_saved = articles_exist.length;
        updated_articles.push({...article,save_count,is_saved,like_count,is_liked})

      }
    res.status(200).json({
      articles:updated_articles,
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


router.post("/posts/top_liked", async (req, res) => {
    try {
      const {article_id,user_id} = req.body;
      const exist_article = await posts_db.collection('liked_articles').find({
        article_id,user_id,
      }).toArray();
      if(exist_article.length>0){
        const result = await posts_db.collection('liked_articles').deleteOne({
          article_id,user_id,
        })
        if(result){
          return res.status(200).json({status:true, message: 'You unliked this article'});
        }
      }else{
        await posts_db.collection('liked_articles').insertOne({
          article_id,user_id,
        });
        res.status(200).json({status:true,message:'You liked this article'});
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } 
  }
);



router.post("/posts/top_saved", async (req, res) => {
  try {
    const {article_id,user_id} =req.body;
    const exist_article = await posts_db.collection('saved_articles').find({
      article_id,user_id,
    }).toArray();
    if(exist_article.length>0){
      const result = await posts_db.collection('saved_articles').deleteOne({
        article_id,user_id,
      })
      if(result){
        return res.status(200).json({status:true, message: 'You unsaved this article'});
      }
    }else{
      await posts_db.collection('saved_articles').insertOne({
        article_id,user_id,
      });
      res.status(200).json({status:true,message:'You saved this article'});
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/posts/saved_articles",verifyToken,checkUserStatus, async (req, res) => {
  try {
    const {user_id} =req.body;
    const articles = await posts_db.collection('saved_articles').find({user_id:user_id}).toArray();
    // console.log('====================================');
    // console.log('articles----'+JSON.stringify(articles));
    // console.log('====================================');

    if(articles.length > 0 ){
      
      const articlesCollection = posts_db.collection('articles');

      let saved_articles = [];
      for(let article of articles){
        const query = { _id: new ObjectId(article.article_id) };
        const articlesData = await articlesCollection.find(query).toArray();
        if(articlesData.length > 0){
          saved_articles.push(articlesData[0]);
        }
      }

      let updated_articles = [];

      for(let article of saved_articles){

        const saved_articles = await posts_db.collection('saved_articles').find({
          article_id: article._id.toString()
        }).toArray();

        const liked_articles = await posts_db.collection('liked_articles').find({
          article_id: article._id.toString()
        }).toArray();

        const articles_exist = await posts_db.collection('saved_articles').find({
          article_id: article._id.toString(), user_id: req.user.id
        }).toArray();

        const liked_exist = await posts_db.collection('liked_articles').find({
          article_id: article._id.toString(), user_id: req.user.id
        }).toArray();


        const like_count = liked_articles.length;
        const is_liked = liked_exist.length;

        const save_count = saved_articles.length;
        const is_saved = articles_exist.length;
        updated_articles.push({...article,save_count,is_saved,like_count,is_liked})

      }

      return res.status(200).json({status:true,data:updated_articles, message: 'Your saved articles'});

    }else{
      res.status(200).json({status:true,data:[],message:'No articles found'});
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});




// Admin only - Update article
router.put("/posts/:article_id", verifyToken,checkUserStatus, requireAdmin, async (req, res) => {
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
router.delete("/posts/:article_id", verifyToken,checkUserStatus, requireAdmin, async (req, res) => {
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
router.post('/posts/:article_id/', verifyToken,checkUserStatus, async (req, res) => {
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
