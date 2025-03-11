import express from "express";
import { MongoClient } from "mongodb";
import { users_db, posts_db, checkConnection, news_db } from "../db/conn.mjs";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import jwt from 'jsonwebtoken';
import getMongoPasscode from "../password.mjs";
import { fetchNewsArticles } from "../scripts/fetch-news.mjs";

const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.buqut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
    retryWrites: true,
    w: 'majority'
});

const router = express.Router();

// Add NewsData.io routes
router.post("/newsdata/config", verifyToken, requireAdmin, async (req, res) => {
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

        res.status(200).json({ success: true, message: "NewsData.io key configured successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/newsdata/fetch", verifyToken, requireAdmin, async (req, res) => {
    try {
        const result = await fetchNewsArticles();
        if (!result) {
            return res.status(400).json({ success: false, message: "NewsData.io API key not configured" });
        }
        res.status(200).json({ success: true, addedCount: result?.addedCount || 0 });
    } catch (err) {
        console.error('Error in /newsdata/fetch:', err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch articles";
        res.status(500).json({ success: false, message: errorMessage });
    }
});

export default router;
