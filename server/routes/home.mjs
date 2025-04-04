import express from "express";
import { ObjectId } from "mongodb";
import { users_db, posts_db, events_db } from "../db/conn.mjs";
import { checkUserStatus, verifyToken } from "../middleware/auth.mjs";

const router = express.Router();

// Get upcoming events for the home page
router.get("/upcoming-events", verifyToken, async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    
    // Find events that are happening in the future
    const events = await events_db.collection("events").find({
      event_date: { $gte: currentDate.toISOString().split('T')[0] }
    })
    .sort({ event_date: 1 }) // Sort by date ascending (soonest first)
    .limit(3) // Limit to 3 events
    .toArray();
    
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming events" });
  }
});

// Get featured brands/vendors for the home page
router.get("/featured-brands", verifyToken, async (req, res) => {
  try {
    // Find vendors with featured flag or sort by some criteria
    const vendors = await users_db.collection("vendor_info").find({
      // You can add criteria here, like featured: true
    })
    .limit(4) // Limit to 4 featured brands
    .toArray();
    
    // Get additional info for each vendor
    const vendorsWithDetails = await Promise.all(
      vendors.map(async (vendor) => {
        const userInfo = await users_db.collection("customer_info").findOne({
          _id: new ObjectId(vendor.vendor_id)
        });
        
        return {
          _id: vendor.vendor_id,
          name: userInfo?.name || "Unknown Vendor",
          description: vendor.intro || "Sustainable fashion vendor",
          image: vendor.image || null,
          shop_now_link: vendor.shop_now_link || null
        };
      })
    );
    
    res.status(200).json(vendorsWithDetails);
  } catch (error) {
    console.error("Error fetching featured brands:", error);
    res.status(500).json({ success: false, message: "Failed to fetch featured brands" });
  }
});

// Get workshops for the home page
router.get("/workshops", verifyToken, async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    
    // Find events that are workshops
    const workshops = await events_db.collection("events").find({
      event_date: { $gte: currentDate.toISOString().split('T')[0] },
      event_type: "workshop" // Using the event_type field
    })
    .sort({ event_date: 1 }) // Sort by date ascending
    .limit(2) // Limit to 2 workshops
    .toArray();
    
    res.status(200).json(workshops);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workshops" });
  }
});

// Get all home page data in a single request
router.get("/all", verifyToken,checkUserStatus, async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Get upcoming events (regular events only)
    const upcomingEvents = await events_db.collection("events").find({
      event_date: { $gte: currentDateStr },
      event_type: "regular" // Only get regular events
    })
    .sort({ event_date: 1 })
    .limit(3)
    .toArray();
    
    // Get 2 random featured brands from customer_info collection
    let featuredBrands = [];
    
    // Find all users with user_roles = 2 (vendors) and shop_info
    const vendorCount = await users_db.collection("customer_info").countDocuments({ 
      user_roles: 2,
      shop_info: { $exists: true } 
    });
    
    if (vendorCount > 0) {
      // If there are vendors, get up to 2 random ones
      const limit = Math.min(2, vendorCount);
      
      // Use aggregation to get random vendors
      const vendors = await users_db.collection("customer_info").aggregate([
        { $match: { 
          user_roles: 2,
          shop_info: { $exists: true } 
        }},
        { $sample: { size: limit } }
      ]).toArray();
      
      // Format the vendor data for the home screen
      featuredBrands = vendors.map(vendor => {
        // Support both new and old field names
        const imageUrl = vendor.shop_info?.url || vendor.shop_info?.title || null;
        const socialLink = vendor.shop_info?.social_link || vendor.shop_info?.intro || null;
        
        return {
          _id: vendor._id.toString(),
          name: vendor.shop_info?.brand_name || `${vendor.first_name} ${vendor.last_name}`,
          description: socialLink || "Sustainable fashion vendor",
          image: imageUrl,
          shop_now_link: vendor.shop_info?.shop_now_link || null
        };
      });
    }
    
    // Get workshops
    const workshops = await events_db.collection("events").find({
      event_date: { $gte: currentDateStr },
      event_type: "workshop"
    })
    .sort({ event_date: 1 })
    .limit(2)
    .toArray();
    
    // Get the latest event with ticket information for the "Get Your Tickets" section
    // Include both regular and workshop events
    const featuredTicketEvent = await events_db.collection("events").findOne({
      event_date: { $gte: currentDateStr },
      ticket_url: { $exists: true, $ne: "" }, // Must have a ticket URL
      $or: [
        { event_type: "regular" },
        { event_type: "workshop" }
      ]
    }, {
      sort: { event_date: 1 } // Sort by date ascending to get the soonest event
    });
    
    // Return all data
    res.status(200).json({
      upcomingEvents,
      featuredBrands,
      workshops,
      featuredTicketEvent // This will be null if no event with tickets is found
    });
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ success: false, message: "Failed to fetch home page data" });
  }
});

export default router;
