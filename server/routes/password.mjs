import express from "express";
import { users_db } from "../db/conn.mjs";
const router = express.Router();

// Store verification codes temporarily (in a production environment, use Redis or similar)
// const verificationCodes = new Map();

// // Generate a random 6-digit code
// const generateVerificationCode = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// Send verification code
router.post("/forgot-password", async (req, res) => {
  // console.log("Received forgot-password request at /password/forgot");
  // console.log("Request body:", req.body);
  // console.log("Request headers:", req.headers);
  
  if (!users_db) {
    console.error("MongoDB connection not established");
    return res.status(500).json({ success: false, message: "Database connection error" });
  }

  try {
    if (!req.body || !req.body.hashed_email) {
      console.error("Missing hashed_email in request body");
      return res.status(400).json({ success: false, message: "Missing email" });
    }

    const { hashed_email } = req.body;

    console.log("Checking user_login collection...");
    const userLoginCollection = users_db.collection("user_login");
    const userLogin = await userLoginCollection.findOne({ hashed_email });

    if (!userLogin) {
      console.log("User not found in user_login");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // console.log("Checking customer_info collection...");
    // const customerInfoCollection = users_db.collection("customer_info");
    // const userInfo = await customerInfoCollection.findOne({ hashed_email });
    // console.log("Found user in customer_info:", userInfo ? "Yes" : "No");

    // if (!userInfo) {
    //   console.log("User not found in customer_info");
    //   return res.status(404).json({ success: false, message: "User not found" });
    // }

    // // Generate verification code
    // const code = generateVerificationCode();
    
    // // Store code with timestamp (expires in 10 minutes)
    // verificationCodes.set(hashed_email, {
    //   code,
    //   timestamp: Date.now(),
    //   attempts: 0
    // });

    // // For testing: Log the code to console
    // console.log(`Verification code for ${hashed_email}: ${code}`);

    res.json({ success: true, message: "Email is exist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send verification code" });
  }
});

// Verify code
// router.post("/verify-code", async (req, res) => {
//   try {
//     const { hashed_email, code } = req.body;

//     const verification = verificationCodes.get(hashed_email);

//     if (!verification) {
//       return res.status(400).json({ success: false, message: "No verification code found" });
//     }

//     // Check if code is expired (10 minutes)
//     if (Date.now() - verification.timestamp > 10 * 60 * 1000) {
//       verificationCodes.delete(hashed_email);
//       return res.status(400).json({ success: false, message: "Verification code expired" });
//     }

//     // Check attempts
//     if (verification.attempts >= 3) {
//       verificationCodes.delete(hashed_email);
//       return res.status(400).json({ success: false, message: "Too many attempts. Request a new code." });
//     }

//     // Verify code
//     if (verification.code !== code) {
//       verification.attempts++;
//       return res.status(400).json({ success: false, message: "Invalid code" });
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error in verify-code:", error);
//     res.status(500).json({ success: false, message: "Failed to verify code" });
//   }
// });

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { hashed_email, hashed_password } = req.body;

    // const verification = verificationCodes.get(hashed_email);

    // if (!verification || verification.code !== code) {
    //   return res.status(400).json({ success: false, message: "Invalid verification" });
    // }

    // Update password in both collections
    const userLoginResult = await users_db.collection("user_login").updateOne(
      { hashed_email },
      { $set: { hashed_password } }
    );

    const customerInfoResult = await users_db.collection("customer_info").updateOne(
      { hashed_email },
      { $set: { hashed_password } }
    );

    if (userLoginResult.modifiedCount === 0 && customerInfoResult.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Failed to update password" });
    }

    // Clear verification code
    // verificationCodes.delete(hashed_email);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

export default router;
