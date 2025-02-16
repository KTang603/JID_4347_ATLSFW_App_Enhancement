import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import { news_db } from "../db/conn.mjs";

const router = express.Router();

// Protect all routes with admin authentication
router.use(verifyToken, requireAdmin);

// Get current API key
router.get("/api-key", async (req, res) => {
  try {
    const config = await news_db.collection('config').findOne({ type: 'newsapi' });
    res.json({ apiKey: config?.apiKey || null });
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update API key
router.post("/api-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "API key is required" });
    }

    await news_db.collection('config').updateOne(
      { type: 'newsapi' },
      { $set: { apiKey, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, message: "API key updated successfully" });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Manually trigger news fetch
router.post("/fetch", async (req, res) => {
  try {
    const { fetchNewsArticles } = await import('../scripts/fetch-news.mjs');
    await fetchNewsArticles();
    res.json({ success: true, message: "News fetch triggered successfully" });
  } catch (error) {
    console.error('Error triggering news fetch:', error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
