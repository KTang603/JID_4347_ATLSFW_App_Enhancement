import express from "express";
import { posts_db, users_db } from "../db/conn.mjs";
import jwt from 'jsonwebtoken';

/*
enum AccountType {
  Vendor,
  Admin,
  General,
}
*/

const router = express.Router();

router.get("/", async (req, res) => {
    res.json({ success: true });
});

router.post("/", async (req, res) => {
    try {
    const { hashed_email, hashed_password } = req.body;
    if (!hashed_email || !hashed_password) {
        return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    console.log('Login attempt for hashed_email:', hashed_email);
    console.log('Checking user_login collection...');
        const existingUser = await users_db.collection('user_login').findOne({ hashed_email: hashed_email, hashed_password: hashed_password });
    if (!existingUser) {
        console.log('Login failed: User not found or incorrect password');
        return res.status(400).json({ success: false, message: 'The email-password combination is incorrect' });
    }
    console.log('User found in user_login with account_type:', existingUser.account_type);

    console.log('Checking customer_info collection...');
    const userInfo = await users_db.collection('customer_info').findOne({ hashed_email });
        if (!userInfo) {
            console.log('Customer info not found for user');
            return res.status(500).json({ success: false, message: 'User information not found' });
        }

        if (existingUser.account_type == 2) {
            const vendor_info = await users_db.collection("vendor_info").findOne({ vendor_id: userInfo._id });
            if (vendor_info == null) {
                return res.status(500).json({ success: false, message: "Vendor does not exist" });
            } else if (vendor_info.vendor_account_initialized == false) {
                userInfo.vendor_account_initialized = false;
            } else {
                userInfo.brand_name = vendor_info.brand_name;
                userInfo.title = vendor_info.title;
                userInfo.intro = vendor_info.intro;
                userInfo.shop_now_link = vendor_info.shop_now_link;
                userInfo.vendor_account_initialized = true;
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: userInfo._id.toString(),
                accountType: existingUser.account_type 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful, returning token with accountType:', existingUser.account_type);
        res.status(200).json({
            success: true,
            account_type: existingUser.account_type,
            user: userInfo,
            token: token
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;
