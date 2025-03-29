import express from "express";
import { posts_db, users_db } from "../db/conn.mjs";
import jwt from "jsonwebtoken";
import { ADMIN_ROLES, VENDOR_ROLES, ACTIVATE_STATUS, DEACTIVATE_STATUS } from "../utils/constant.mjs";

/*
enum AccountType {
  Vendor,
  Admin,
  General,
}
*/

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { hashed_email, hashed_password } = req.body;
    if (!hashed_email || !hashed_password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }
    const existingUser = await users_db
      .collection("user_login")
      .findOne({
        hashed_email: hashed_email,
        hashed_password: hashed_password,
      });
    if (!existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "The email-password combination is incorrect",
        });
    }

    const userInfo = await users_db
      .collection("customer_info")
      .findOne({ hashed_email });
    if (!userInfo) {
      return res
        .status(500)
        .json({ success: false, message: "User information not found" });
    }

    // Check if user is deactivated (skip for admin users)
    if (userInfo.user_roles !== ADMIN_ROLES && 
        (userInfo.user_status === DEACTIVATE_STATUS || userInfo.user_status === false)) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator.",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    if (existingUser.user_roles == VENDOR_ROLES) {
      const vendor_info = await users_db
        .collection("vendor_info")
        .findOne({ vendor_id: userInfo._id });
      if (vendor_info == null) {
        return res
          .status(500)
          .json({ success: false, message: "Vendor does not exist" });
      } else {
        userInfo.brand_name = vendor_info.brand_name;
        userInfo.title = vendor_info.title;
        userInfo.intro = vendor_info.intro;
        userInfo.shop_now_link = vendor_info.shop_now_link;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: userInfo._id.toString(),
        accountType: userInfo.user_roles,
      },
      process.env.JWT_SECRET || "your-secret-key"
      // { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      accountType: userInfo.user_roles,
      user: userInfo,
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
