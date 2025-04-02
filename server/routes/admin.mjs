import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { users_db, posts_db, checkConnection, news_db,third_party_db } from "../db/conn.mjs";
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

// activate:1 (user_status)
// deactivate:0 (user_status)

// user_status
// user_id
// token

// user_status: 0,

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
    // Find articles where author_role is admin (3)
    const articles = await posts_db.collection("articles").find({ 
      author_role: 3  // Admin role
    }).toArray();
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Get most liked articles
router.get("/most-liked", async (req, res) => {
  try {
    const articles = await posts_db.collection("articles").find({})
      // Old code: .sort({ likes: -1 })
      .sort({ like_count: -1 })
      .limit(10)
      .toArray();
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching most liked articles:", error);
    res.status(500).json({ error: "Failed to fetch most liked articles" });
  }
});

// Get most saved articles
router.get("/most-saved", async (req, res) => {
  try {
    const articles = await posts_db.collection("articles").find({})
      // Old code: .sort({ saves: -1 })
      .sort({ save_count: -1 })
      .limit(10)
      .toArray();
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

        await news_db.collection('config').updateOne(
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
        const config = await news_db.collection('config').findOne({ type: 'newsdata' });
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
    const thirdPartyDb = await third_party_db.collection("config")
    // const status = await thirdPartyDb.insertOne(
    //   { "api_key": api_key }
    //   // { $set: { "api_key": api_key } }    
    // );
    
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
