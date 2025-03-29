import express from "express";
import { users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { verifyToken, checkUserStatus } from "../middleware/auth.mjs";

const router = express.Router();

router.get('/articles', verifyToken, checkUserStatus, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        // Validate user_id
        if (!user_id || !ObjectId.isValid(user_id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid user ID' 
            });
        }

        const users = users_db.collection('customer_info');
        
        const user = await users.findOne({ _id: new ObjectId(user_id) });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Initialize arrays if they don't exist
        if (!user.liked_articles) {
            await users.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { liked_articles: [] } }
            );
        }
        if (!user.saved_articles) {
            await users.updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { saved_articles: [] } }
            );
        }

        // Convert all article IDs to strings
        const liked_articles = Array.isArray(user.liked_articles)
            ? user.liked_articles.map(id => id?.toString()).filter(Boolean)
            : [];
        const saved_articles = Array.isArray(user.saved_articles)
            ? user.saved_articles.map(id => id?.toString()).filter(Boolean)
            : [];

        // Debug logging
        console.log('Fetched user articles:', {
            user_id,
            liked_articles,
            saved_articles
        });

        res.status(200).json({
            success: true,
            liked_articles,
            saved_articles
        });
    } catch (error) {
        console.error('Error fetching user articles:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
});

router.get('/get_profile', verifyToken, checkUserStatus, async (req, res) => {
        const user_id = req.query.userId;
        // Validate user_id
        if (!user_id || !ObjectId.isValid(user_id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid user ID' 
            });
        }

        const users = await users_db.collection('customer_info').findOne({_id: new ObjectId(user_id)});
        res.status(200).json({
            success: true,
            ...users
        });
})


router.patch('/edit', verifyToken, checkUserStatus, async (req, res) => {
    try {
        const {user_id} = req.query;
        console.log('user_id---'+user_id);
        const updates = req.body;
        console.log('user_updates---'+JSON.stringify(updates));

    
        // Validate if there's something to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).send('No updates provided');
        }

        const users = users_db.collection('customer_info');

        // Update user document
        const result = await users.updateOne(
            { _id: new ObjectId(user_id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).send('User updated successfully');
    } catch (e) {
        console.log(e);
        res.status(500).send('Error updating user');
    }
});

export default router;
