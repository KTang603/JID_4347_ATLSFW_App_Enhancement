import { MongoClient, ObjectId } from "mongodb";
import { users_db } from "../db/conn.mjs";

// Function to check user status
async function checkUserStatus(email) {
  try {
    // Find user by email
    const user = await users_db.collection("customer_info").findOne({ 
      user_email: email 
    });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log("User found:");
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Email: ${user.user_email}`);
    console.log(`Username: ${user.username}`);
    console.log(`User Roles: ${user.user_roles}`);
    console.log(`User Status: ${user.user_status}`);
    
    // Check if user_status exists and its value
    if (user.user_status === undefined || user.user_status === null) {
      console.log("User status is not set");
    } else if (user.user_status === 0) {
      console.log("User is DEACTIVATED");
    } else if (user.user_status === 1) {
      console.log("User is ACTIVATED");
    } else {
      console.log(`User has unknown status value: ${user.user_status}`);
    }
    
  } catch (error) {
    console.error("Error checking user status:", error);
  }
}

// Check the toggleblock user
checkUserStatus("toggleblock@gmail.com");
