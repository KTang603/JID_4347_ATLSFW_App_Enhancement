import express from "express";
import {events_db } from "../db/conn.mjs";
import { verifyToken, requireAdmin, requirePermisssion } from "../middleware/auth.mjs";

const router = express.Router();

// Middleware to verify token for protected routes
// For ADMIN
router.use(['/events/create', '/events/delete', '/events/update'], verifyToken);

// Admin only - Create Event
router.post("/events/create",requirePermisssion, async (req, res) => {
  const { event_title, event_desc, event_link, event_location, event_date, user_id} = req.body;
  if (!event_title || !event_desc || !event_link || !event_location || !event_date) {
      return res.status(400).json({ success: false, message: 'Missing event information' });
  }
  try {
    await events_db.collection('events').insertOne({
        event_title,
        event_desc,
        event_link,
        event_location,
        event_date,
        user_id,
    });
    res.status(200).json({ success: true,message:'Event created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/events", verifyToken, async (req, res) => {
    try{
        const collection = events_db.collection('events');
        const result = await collection.find({}).toArray();
        res.status(200).json({
            ...result
          });
    }catch(err){
        console.log('err----'+err);
        res.status(500).send("Internal Server Error");
    }
  
});







export default router;
