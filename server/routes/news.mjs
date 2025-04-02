import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import { news_db } from "../db/conn.mjs";

const router = express.Router();

// Protect all routes with admin authentication
router.use(verifyToken, requireAdmin);

// Manually trigger news fetch
router.get("/fetch", async (req, res) => {
  try {
    const { fetchNewsArticles } = await import('../scripts/fetch-news.mjs');
    const result = await fetchNewsArticles();
    if (!result) {
      return res.status(400).json({ success: false, message: "NewsData.io API key not configured" });
    }
    res.json({ success: true, message: `Successfully added ${result.addedCount} new articles` });
  } catch (error) {
    console.error('Error triggering news fetch:', error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
});

export default router;
