import express from "express";
import { users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.patch('/edit/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const updates = req.body;
    
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