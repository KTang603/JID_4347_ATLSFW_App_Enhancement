import express from "express";
import { MongoClient } from "mongodb";
import { users_db, posts_db, checkConnection } from "../db/conn.mjs";
import { verifyToken, requireAdmin } from "../middleware/auth.mjs";
import jwt from 'jsonwebtoken';
import getMongoPasscode from "../password.mjs";

const uri = "mongodb+srv://" + getMongoPasscode() + "@cluster0.buqut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
    retryWrites: true,
    w: 'majority'
});

const router = express.Router();

// Remove auth middleware from router.use since we need the initialize endpoint to be accessible
// Add middleware to specific routes instead

router.post("/initialize", async (req, res) => {
    try {
        // Check database connection
        if (!(await checkConnection())) {
            throw new Error('Database connection is not available');
        }

        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        console.log('Received initialize request for hashed_email:', hashed_email);
        console.log('Current database connection status:', await checkConnection());

        // Check if any admin exists
        const userLoginCollection = users_db.collection('user_login');
        console.log('Checking if any admin exists...');
        const adminExists = await userLoginCollection.findOne({ account_type: 1 });
        console.log('Admin exists check result:', adminExists ? 'Yes' : 'No');
        
        if (adminExists) {
            return res.status(400).json({ success: false, message: "Admin already exists. Use regular admin authorization." });
        }

        // Check if the user exists and is not already an admin
        console.log('Looking up user in user_login with hashed_email:', hashed_email);
        let user = await userLoginCollection.findOne({ hashed_email });
        console.log('User login lookup result:', user);
        
        // If user not found in user_login, check customer_info
        if (!user) {
            console.log('User not found in user_login collection');
            const customerInfo = await users_db.collection('customer_info').findOne({ hashed_email });
            console.log('Customer info lookup result:', customerInfo ? 'Found' : 'Not found');
            
            if (customerInfo) {
                // Create user_login record if customer exists but login record is missing
                console.log('Creating user_login record for existing customer');
                await users_db.collection('user_login').insertOne({
                    hashed_email,
                    account_type: 3, // Start as general user
                    hashed_password: customerInfo.hashed_password || '' // Use existing password if available
                });
                user = await users_db.collection('user_login').findOne({ hashed_email });
            } else {
                return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
            }
        }
        console.log('Found user in user_login with account_type:', user.account_type);
        if (user.account_type === 1) {
            console.log('User is already an admin with account_type:', user.account_type);
            return res.status(400).json({ success: false, message: "This user is already an admin. No need to authorize." });
        }

        // Make the user an admin
        console.log('Updating user to admin status...');
        const result = await userLoginCollection.updateOne(
            { hashed_email }, 
            { $set: { account_type: 1 } }
        );
        console.log('Update result:', result);

        if (result.matchedCount === 0) {
            console.error('Update failed - no matching document found');
            return res.status(404).json({ success: false, message: "Failed to update user" });
        }

        if (result.modifiedCount === 0) {
            console.log('No modifications made - user might already be an admin');
            return res.status(400).json({ success: false, message: "No changes made to user status" });
        }

        // Generate a new token with admin privileges
        console.log('Generating new admin token...');
        const userInfo = await users_db.collection('customer_info').findOne({ hashed_email });
        console.log('Found user info for token:', userInfo ? 'Yes' : 'No');
        const token = jwt.sign(
            { 
                id: userInfo._id.toString(),
                accountType: 1 // admin account type
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true, 
            message: "First admin authorized successfully",
            token: token // Return new token so frontend can update it
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Add auth middleware to protected routes
// Add logging middleware
const logRequest = (req, res, next) => {
  console.log('Admin route request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [token]' : 'none',
      'content-type': req.headers['content-type']
    }
  });
  next();
};

router.use(logRequest);

// Protected routes
router.use(['/authorize', '/deauthorize', '/user'], verifyToken, requireAdmin);

// Authorize admin
router.post("/authorize", async (req, res) => {
    try {
        // Check database connection
        if (!(await checkConnection())) {
            throw new Error('Database connection is not available');
        }

        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        console.log('Received authorize request for hashed_email:', hashed_email);

        // Check if any admin exists
        const userLoginCollection = users_db.collection('user_login');
        console.log('Checking if any admin exists...');
        const adminExists = await userLoginCollection.findOne({ account_type: 1 });
        console.log('Admin exists check result:', adminExists ? 'Yes' : 'No');

        // If no admin exists, this will be the first admin
        if (!adminExists) {
            console.log('No admin exists, treating this as first admin initialization');
            return res.redirect(307, '/admin/initialize');
        }

        // Check if user exists in user_login
        console.log('Looking up user in user_login with hashed_email:', hashed_email);
        let user = await userLoginCollection.findOne({ hashed_email });
        console.log('User login lookup result:', user);
        
        // If user not found in user_login, check customer_info
        if (!user) {
            console.log('User not found in user_login collection');
            const customerInfo = await users_db.collection('customer_info').findOne({ hashed_email });
            console.log('Customer info lookup result:', customerInfo ? 'Found' : 'Not found');
            
            if (customerInfo) {
                // Create user_login record if customer exists but login record is missing
                console.log('Creating user_login record for existing customer');
                await users_db.collection('user_login').insertOne({
                    hashed_email,
                    account_type: 3, // Start as general user
                    hashed_password: customerInfo.hashed_password || '' // Use existing password if available
                });
                user = await users_db.collection('user_login').findOne({ hashed_email });
            } else {
                return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
            }
        }

        // Check if user is already an admin
        if (user.account_type === 1) {
            console.log('User is already an admin with account_type:', user.account_type);
            return res.status(400).json({ success: false, message: "This user is already an admin. No need to authorize." });
        }

        // Start a session for the transaction
        const session = client.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Make the user an admin
                console.log('Updating user to admin status...');
                const result = await userLoginCollection.updateOne(
                    { hashed_email }, 
                    { $set: { account_type: 1 } },
                    { session }
                );
                console.log('Update result:', result);

                if (result.matchedCount === 0) {
                    throw new Error('No matching document found');
                }

                if (result.modifiedCount === 0) {
                    throw new Error('No modifications made - user might already be an admin');
                }

                // Verify the update
                const verifyUpdate = await userLoginCollection.findOne(
                    { hashed_email },
                    { session }
                );
                console.log('Verification result:', verifyUpdate);

                if (verifyUpdate.account_type !== 1) {
                    throw new Error('Failed to verify admin status update');
                }
            });

            console.log('Successfully updated user to admin status');
            res.status(200).json({ success: true, message: "Admin authorized successfully" });
        } catch (error) {
            console.error('Transaction error:', error);
            if (error.message.includes('No matching document')) {
                return res.status(404).json({ success: false, message: "Failed to update user" });
            }
            if (error.message.includes('already be an admin')) {
                return res.status(400).json({ success: false, message: "No changes made to user status" });
            }
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Deauthorize admin
router.post("/deauthorize", async (req, res) => {
    try {
        // Check database connection
        if (!(await checkConnection())) {
            throw new Error('Database connection is not available');
        }

        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        console.log('Received deauthorize request for hashed_email:', hashed_email);

        // Check if user exists in user_login
        console.log('Looking up user in user_login with hashed_email:', hashed_email);
        const userLoginCollection = users_db.collection('user_login');
        let user = await userLoginCollection.findOne({ hashed_email });
        console.log('User login lookup result:', user);
        
        // If user not found in user_login, check customer_info
        if (!user) {
            console.log('User not found in user_login collection');
            const customerInfo = await users_db.collection('customer_info').findOne({ hashed_email });
            console.log('Customer info lookup result:', customerInfo ? 'Found' : 'Not found');
            
            if (customerInfo) {
                // Create user_login record if customer exists but login record is missing
                console.log('Creating user_login record for existing customer');
                await users_db.collection('user_login').insertOne({
                    hashed_email,
                    account_type: 3, // Start as general user
                    hashed_password: customerInfo.hashed_password || '' // Use existing password if available
                });
                user = await users_db.collection('user_login').findOne({ hashed_email });
            } else {
                return res.status(404).json({ success: false, message: "Account associated with email does not exist" });
            }
        }

        // Check if user is not an admin
        if (user.account_type !== 1) {
            console.log('User is not an admin, current account_type:', user.account_type);
            return res.status(400).json({ success: false, message: "This user is not an admin. No need to deauthorize." });
        }

        // Start a session for the transaction
        const session = client.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Set user back to general user
                console.log('Updating user to general user status...');
                const result = await userLoginCollection.updateOne(
                    { hashed_email }, 
                    { $set: { account_type: 3 } },
                    { session }
                );
                console.log('Update result:', result);

                if (result.matchedCount === 0) {
                    throw new Error('No matching document found');
                }

                if (result.modifiedCount === 0) {
                    throw new Error('No modifications made - user might not be an admin');
                }

                // Verify the update
                const verifyUpdate = await userLoginCollection.findOne(
                    { hashed_email },
                    { session }
                );
                console.log('Verification result:', verifyUpdate);

                if (verifyUpdate.account_type !== 3) {
                    throw new Error('Failed to verify general user status update');
                }
            });

            console.log('Successfully updated user to general user status');
            res.status(200).json({ success: true, message: "Admin deauthorized successfully" });
        } catch (error) {
            console.error('Transaction error:', error);
            if (error.message.includes('No matching document')) {
                return res.status(404).json({ success: false, message: "Failed to update user" });
            }
            if (error.message.includes('might not be an admin')) {
                return res.status(400).json({ success: false, message: "No changes made to user status" });
            }
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Delete user
router.delete("/user", async (req, res) => {
    try {
        // Check database connection
        if (!(await checkConnection())) {
            throw new Error('Database connection is not available');
        }

        const { hashed_email } = req.body;

        if (!hashed_email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        console.log('Received delete request for hashed_email:', hashed_email);
        console.log('Current database connection status:', await checkConnection());

        // Check if user exists in either collection
        console.log('Looking up user in customer_info with hashed_email:', hashed_email);
        const customer = await users_db.collection('customer_info').findOne({ hashed_email });
        console.log('Looking up user in user_login with hashed_email:', hashed_email);
        const loginUser = await users_db.collection('user_login').findOne({ hashed_email });

        if (!customer && !loginUser) {
            console.log('User not found in either collection');
            return res.status(404).json({ success: false, message: "User not found in any collection" });
        }

        if (!customer) {
            console.log('User found in user_login but not in customer_info');
            return res.status(404).json({ success: false, message: "User login exists but customer info is missing" });
        }

        console.log('Found user, proceeding with deletion');

        try {
            // Delete from all collections
            const [loginResult, customerResult, vendorResult, articlesUpdateResult, articlesDeleteResult] = await Promise.all([
                users_db.collection('user_login').deleteOne({ hashed_email }),
                users_db.collection('customer_info').deleteOne({ hashed_email }),
                users_db.collection('vendor_info').deleteOne({ vendor_id: customer._id }),
                // Remove user's likes and saves from articles
                posts_db.collection('articles').updateMany(
                    { $or: [
                        { author_id: customer._id.toString() },
                        { liked_by: customer._id.toString() },
                        { saved_by: customer._id.toString() }
                    ]},
                    { 
                        $pull: { 
                            liked_by: customer._id.toString(),
                            saved_by: customer._id.toString()
                        }
                    }
                ),
                // Delete user's articles
                posts_db.collection('articles').deleteMany({ author_id: customer._id.toString() })
            ]);

            console.log('Delete operation results:', {
                loginResult,
                customerResult,
                vendorResult,
                articlesUpdateResult,
                articlesDeleteResult
            });

            // Check if the main user records were deleted
            if (loginResult.deletedCount === 0 && customerResult.deletedCount === 0) {
                throw new Error('Failed to delete user records');
            }

            res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error('Error during deletion operations:', error);
            res.status(500).json({ 
                success: false, 
                message: "Failed to complete all deletion operations",
                error: error.message
            });
        }
    } catch (err) {
        console.error('Error in delete user route:', err);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: err.message
        });
    }
});

export default router;
