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
           event: result
          });
    }catch(err){
        console.log('err----'+err);
        res.status(500).send("Internal Server Error");
    }
  
});

// Add requestType for event creation
// Admin only - Create Event
router.post("/events/create", verifyToken, async (req, res) => {
  try {
    // Log received data
    console.log('Received event data:', req.body);

    const { event_title, event_desc, event_link, event_location, event_date, user_id } = req.body;
    
    // Check each field individually and provide specific error
    const missingFields = [];
    if (!event_title) missingFields.push('title');
    if (!event_desc) missingFields.push('description');
    if (!event_link) missingFields.push('link');
    if (!event_location) missingFields.push('location');
    if (!event_date) missingFields.push('date');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing event information: ${missingFields.join(', ')}` 
      });
    }

    // Create event
    const result = await events_db.collection('events').insertOne({
      event_title,
      event_desc,
      event_link,
      event_location,
      event_date,
      user_id,
      created_at: new Date()
    });

    res.status(200).json({ 
      success: true,
      message: 'Event created successfully.',
      eventId: result.insertedId
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create event",
      error: err.message 
    });
  }
});


export default router;
