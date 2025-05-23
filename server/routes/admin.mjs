import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { users_db, posts_db, checkConnection, third_party_db } from "../db/conn.mjs";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import jwt from 'jsonwebtoken';
import { fetchNewsArticles } from "../scripts/fetch-news.mjs";
import { ACTIVATE_STATUS, DEACTIVATE_STATUS, VENDOR_ROLES } from "../utils/constant.mjs";

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await users_db.collection("customer_info").find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/vendors", async (req, res) => {
  try {
    const users = await users_db.collection("customer_info").find({user_roles:VENDOR_ROLES}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users/change_status", async (req, res) => {
  try {
     const { user_id, user_status } = req.body;
     const users = await users_db.collection('customer_info');
     const currentUser = await users.find({_id: new ObjectId(user_id)}).toArray();
      var updated_user = {};
      if(currentUser[0].user_status == null || currentUser[0].user_status === undefined ){
        updated_user =  {...currentUser[0], user_status: DEACTIVATE_STATUS}
      } else if(currentUser[0].user_status === false || currentUser[0].user_status === DEACTIVATE_STATUS) {
        updated_user =  {...currentUser[0], user_status: ACTIVATE_STATUS}
      } else {
        updated_user =  {...currentUser[0], user_status: DEACTIVATE_STATUS}
      }

    // Update user document
    const result = await users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: updated_user }
    );
    res.status(200).json({status:true,message:`This user is ${user_status == ACTIVATE_STATUS ?"Activated":"Deactivated"}`});
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


router.post("/users/create_vendor", async (req, res) => {
  try {
     const { user_id } = req.body;
     
     if(!user_id){
      res.status(200).json({status:false,message:"User_id is missing."});
      return;
     }
     const users = await users_db.collection('customer_info');
     const currentUser = await users.find({_id: new ObjectId(user_id)}).toArray();
     
     var updated_user = {...currentUser[0],user_roles:VENDOR_ROLES};
     
     // Update user roles.
      await users.updateOne(
        { _id: new ObjectId(user_id)},
        { $set: updated_user }
      );
      
      // Check if vendor_info entry exists
      const vendorInfo = await users_db.collection('vendor_info').findOne({ vendor_id: new ObjectId(user_id) });
      
      // Create vendor_info entry if it doesn't exist
      if (!vendorInfo) {
        await users_db.collection('vendor_info').insertOne({ 
          vendor_id: new ObjectId(user_id), 
          vendor_account_initialized: false 
        });
      }
      
    res.status(200).json({status:true,message:"This user is now a vendor."});
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Get user by ID
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await users_db.collection("customer_info").findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get all articles created by admin
router.get("/articles", async (req, res) => {
  try {
    // Find articles created by admin (either source is "Manual" or author_name contains "Admin")
    const articles = await posts_db.collection("articles").find({ 
      $or: [
        { source: "Manual" },
        { author_name: { $regex: "Admin", $options: "i" } }
      ]
    }).toArray();
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Delete an article by ID
router.delete("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Check if the article exists
    const article = await posts_db.collection("articles").findOne({ 
      _id: new ObjectId(articleId)
    });
    
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    // Delete the article
    const result = await posts_db.collection("articles").deleteOne({ 
      _id: new ObjectId(articleId)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

// Delete a shop by ID
router.delete("/shops/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const shopId = req.params.id;
    
    // Check if the shop exists
    const shop = await users_db.collection("customer_info").findOne({ 
      _id: new ObjectId(shopId),
      user_roles: VENDOR_ROLES
    });
    
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    
    // Delete the shop_info from the user document
    const result = await users_db.collection("customer_info").updateOne(
      { _id: new ObjectId(shopId) },
      { 
        $unset: { shop_info: "" }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Failed to delete shop" });
    }
    
    // Also delete the vendor_info entry if it exists
    await users_db.collection("vendor_info").deleteOne({ 
      vendor_id: new ObjectId(shopId) 
    });
    
    res.status(200).json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(500).json({ error: "Failed to delete shop" });
  }
});

// Get most liked articles
router.get("/most-liked", async (req, res) => {
  try {
    // Get all liked articles
    const likedArticles = await posts_db.collection("liked_articles").find({}).toArray();
    
    // Count likes for each article
    const articleLikeCounts = {};
    likedArticles.forEach(like => {
      const articleId = like.article_id;
      if (articleLikeCounts[articleId]) {
        articleLikeCounts[articleId]++;
      } else {
        articleLikeCounts[articleId] = 1;
      }
    });
    
    // Convert to array of { articleId, count } objects
    const articleLikeCountsArray = Object.entries(articleLikeCounts).map(([articleId, count]) => ({
      articleId,
      count
    }));
    
    // Sort by count in descending order
    articleLikeCountsArray.sort((a, b) => b.count - a.count);
    
    // Take top 10
    const top10ArticleIds = articleLikeCountsArray.slice(0, 10).map(item => item.articleId);
    
    // Fetch the actual article data for these IDs
    const articles = [];
    for (const articleId of top10ArticleIds) {
      try {
        // Try to convert to ObjectId if it's a valid ObjectId
        let query;
        if (ObjectId.isValid(articleId)) {
          query = { _id: new ObjectId(articleId) };
        } else {
          query = { news_data_article_id: articleId };
        }
        
        const article = await posts_db.collection("articles").findOne(query);
        if (article) {
          articles.push({
            ...article,
            like_count: articleLikeCounts[articleId]
          });
        }
      } catch (err) {
        console.error(`Error fetching article ${articleId}:`, err);
      }
    }
    
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching most liked articles:", error);
    res.status(500).json({ error: "Failed to fetch most liked articles" });
  }
});

// Get most saved articles
router.get("/most-saved", async (req, res) => {
  try {
    // Get all saved articles
    const savedArticles = await posts_db.collection("saved_articles").find({}).toArray();
    
    // Count saves for each article
    const articleSaveCounts = {};
    savedArticles.forEach(save => {
      const articleId = save.article_id;
      if (articleSaveCounts[articleId]) {
        articleSaveCounts[articleId]++;
      } else {
        articleSaveCounts[articleId] = 1;
      }
    });
    
    // Convert to array of { articleId, count } objects
    const articleSaveCountsArray = Object.entries(articleSaveCounts).map(([articleId, count]) => ({
      articleId,
      count
    }));
    
    // Sort by count in descending order
    articleSaveCountsArray.sort((a, b) => b.count - a.count);
    
    // Take top 10
    const top10ArticleIds = articleSaveCountsArray.slice(0, 10).map(item => item.articleId);
    
    // Fetch the actual article data for these IDs
    const articles = [];
    for (const articleId of top10ArticleIds) {
      try {
        // Try to convert to ObjectId if it's a valid ObjectId
        let query;
        if (ObjectId.isValid(articleId)) {
          query = { _id: new ObjectId(articleId) };
        } else {
          query = { news_data_article_id: articleId };
        }
        
        const article = await posts_db.collection("articles").findOne(query);
        if (article) {
          articles.push({
            ...article,
            save_count: articleSaveCounts[articleId]
          });
        }
      } catch (err) {
        console.error(`Error fetching article ${articleId}:`, err);
      }
    }
    
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching most saved articles:", error);
    res.status(500).json({ error: "Failed to fetch most saved articles" });
  }
});

// Add NewsData.io routes
router.post("/newsdata/config", async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ success: false, message: "API key is required" });
        }

        await third_party_db.collection('config').updateOne(
            { type: 'newsdata' },
            { $set: { apiKey, updatedAt: new Date() } },
            { upsert: true }
        );

        return res.status(200).json({ success: true, message: "API key updated successfully" });
    } catch (error) {
        console.error("Error updating NewsData.io config:", error);
        return res.status(500).json({ success: false, message: "Failed to update API key" });
    }
});

router.get("/newsdata/config", async (req, res) => {
    try {
        const config = await third_party_db.collection('config').findOne({ type: 'newsdata' });
        return res.status(200).json({ success: true, config });
    } catch (error) {
        console.error("Error fetching NewsData.io config:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch API key" });
    }
});

router.post("/newsdata/fetch", async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ success: false, message: "API key is required" });
        }

        const result = await fetchNewsArticles(apiKey);
        return res.status(200).json({ 
            success: true, 
            message: `Successfully fetched ${result.count} articles`,
            count: result.count
        });
    } catch (error) {
        console.error("Error fetching news articles:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch news articles" });
    }
});

router.post("/save_api_key", async (req, res) => {
  try {
    const {api_key} = req.body;
    const thirdPartyDb = await third_party_db.collection("config");
    
    const status = await thirdPartyDb.updateOne(
        { "api_key": api_key },
        { $set: { "api_key": api_key } }    
      );
   if(status.acknowledged){
    res.status(200).json({status:'success',message:"API key saved successfully."});
   } else {
    res.status(200).json({status:'failed',message:"Something went wrong."});
   }
  } catch (error) {
    console.error("Error fetching most saved articles:", error);
    res.status(500).json({ error: "Failed to fetch most saved articles" });
  }
});

router.get("/fetch_news_api_key", async (req, res) => {
  try {
    const thirdPartyDb = await third_party_db.collection("config")
    const response = await thirdPartyDb.findOne({});
   if(response){
    res.status(200).json({status:'success',data: response});
   } else {
    res.status(200).json({status:'failed',message:"Something went wrong."});
   }
  } catch (error) {
    console.error("Error fetching most saved articles:", error);
    res.status(500).json({ error: "Failed to fetch most saved articles" });
  }
});

export default router;
