import express from "express";
import { users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";

/*
enum AccountType {
  Vendor,
  Admin,
  General,
}
*/

const router = express.Router();

// Middleware to ensure only admins can access auth routes
router.use(['/authorize', '/deauthorize'], verifyToken, requireAdmin);

// Middleware to ensure only vendors can access their own routes
router.use(['/discover/create'], verifyToken, async (req, res, next) => {
    try {
        // const { vendor_id } = req.params;
        // if (req.user.id !== vendor_id) {
        //     return res.status(403).json({ success: false, message: "Access denied" });
        // }
        next();
    } catch (error) {
        console.error('Error in vendor auth middleware:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Authorize vendor
router.post("/authorize", async (req, res) => {
    try {
        // Assuming you're passing the hashed_email in the request body
        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        console.log('Received vendor authorize request for hashed_email:', hashed_email);

        const collection = users_db.collection('user_login');  // replace YOUR_DB_NAME_HERE with your database name

        // Use the $set operator to update the account_type field, and upsert: false ensures we're only updating existing documents
        const result = await collection.updateOne({ hashed_email }, { $set: { account_type: 2 } });
        const customer = await users_db.collection('customer_info').findOne({ hashed_email });

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
        } else {
            const vendor_init = await users_db.collection('vendor_info').findOne({ vendor_id: customer._id });
            if (!vendor_init) {
                await users_db.collection('vendor_info').insertOne({ vendor_id: customer._id, vendor_account_initialized: false })
            }
            res.status(200).json({ success: true, message: "Vendor authorized successfully" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/discover/create/:vendor_id", async (req, res) => {
    try {
        // Assuming you're passing the hashed_email in the request body
        const { vendor_id } = req.params;
        const { brand_name, shop_now_link, title, intro } = req.body;

        if (!brand_name || !shop_now_link || !title || !intro) {
            return res.status(400).send("Incomplete discovery information");
        }

        const userDB = users_db.collection('customer_info');
        
        const users = await userDB.findOne({_id: new ObjectId(vendor_id)});
        
        // Create shop_info object with the provided data
        const shopInfo = {
            brand_name: brand_name,
            shop_now_link: shop_now_link,
            url: title,  // Store title as url for image
            social_link: intro  // Store intro as social_link
        };

        // Update user document with shop_info
        const result = await userDB.updateOne(
            { _id: new ObjectId(vendor_id) },
            { 
                $set: { 
                    shop_info: shopInfo,
                    user_roles: 2  // Ensure user is marked as a vendor
                } 
            }
        );

        if(result.matchedCount){
            // Fetch the updated user to return in the response
            const updatedUser = await userDB.findOne({_id: new ObjectId(vendor_id)});
            
            res.status(200).json({
                success: true,
                user: updatedUser,
                message: "Discovery page created successfully"
              });
        } else{
            res.status(400).send("Something went wrong");
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Deauthorize vendor
router.post("/deauthorize", async (req, res) => {
    try {
        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const collection = users_db.collection('user_login');
        
        // First check if user exists and is a vendor
        const user = await collection.findOne({ hashed_email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
        }
        
        if (user.account_type !== 2) { // 2 is vendor account type based on the enum comment at top
            return res.status(400).json({ success: false, message: "This user is not a Vendor. No need to deauthorize" });
        }

        const result = await collection.updateOne(
            { hashed_email }, 
            { $set: { account_type: 3 } } // Set back to general user
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
        }

        // Remove vendor info
        const customer = await users_db.collection('customer_info').findOne({ hashed_email });
        if (customer) {
            await users_db.collection('vendor_info').deleteOne({ vendor_id: customer._id });
        }

        res.status(200).json({ success: true, message: "Vendor deauthorized successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get("/discover/:vendor_id", async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const collection = users_db.collection('vendor_info');
        const result = await collection.findOne({ vendor_id: new ObjectId(vendor_id) });
        if (!result) {
            res.status(400).send("Vendor does not exist");
        } else if (result.vendor_account_initialized == false) {
            return res.status(400).json({ success: false, message: "Vendor discovery page uninitialized" });
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Get all shops
router.get("/shop/all", async (req, res) => {
    try {
        const userDB = users_db.collection('customer_info');
        
        // Find all users with user_roles = 2 (vendors) and shop_info
        const vendors = await userDB.find({ 
            user_roles: 2,
            shop_info: { $exists: true } 
        }).toArray();
        
        res.status(200).json({ 
            success: true, 
            vendors: vendors 
        });
    } catch (err) {
        console.error('Error fetching shops:', err);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});

export default router;
