import jwt from "jsonwebtoken";
import { users_db } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { ADMIN_ROLES, USER_ROLES, ACTIVATE_STATUS, DEACTIVATE_STATUS } from "../utils/constant.mjs";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id || !decoded.accountType) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.id,
      accountType: decoded.accountType,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (req.user.accountType == USER_ROLES) {
    // 1 is user account type
    return res.status(403).json({ message: "Admin or vendor access required" });
  }
  next();
};

export const checkUserStatus = async (req, res, next) => {
  try {
    // Skip this check for admin users
    if (req.user.accountType === ADMIN_ROLES) {
      return next();
    }

    // Get user from database to check status
    const user = await users_db.collection("customer_info").findOne({ 
      _id: new ObjectId(req.user.id) 
    });

    // If user not found or is deactivated
    if (!user || user.user_status === DEACTIVATE_STATUS || user.user_status === false) {
      return res.status(403).json({ 
        message: "Account has been deactivated", 
        code: "ACCOUNT_DEACTIVATED" 
      });
    }

    // User is active, proceed
    next();
  } catch (error) {
    return res.status(500).json({ 
      message: "Error checking user status", 
      error: error.message 
    });
  }
};

export const requirePermisssion = (req, res, next) => {
  const { accountType } = req.user;
  const { requestType } = req.body;

  switch (requestType) {
    case "EVENT":
       if(accountType != ADMIN_ROLES ) {
        return res.status(403).json({ message: "User not authenticated" });
       } else { next(); }
      break;
    case "ARTICLE":
      if(accountType != USER_ROLES ) {
        return res.status(403).json({ message: "User not authenticated" });
       } else { next(); }
      break;
    default:
      next();
      break;
  }
};
