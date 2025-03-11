import { users_db } from "../db/conn.mjs";
import { ADMIN_ROLES } from "../utils/constant.mjs";
import crypto from 'crypto';

function hashString(data) {
    const hash = crypto.createHash('sha256')
        .update(data)
        .digest('hex');
    return hash;
}

async function createAdminUser() {
    try {
        const username = 'vivekadmin';
        const password = 'Passowrd123@';
        const email = `${username}@gmail.com`; // Creating an email since it's required

        const hashed_email = await hashString(email);
        const hashed_password = await hashString(password);

        // Check if user already exists
        const existingUser = await users_db.collection("user_login").findOne({ hashed_email });
        if (existingUser) {
            console.log("Admin user already exists");
            return;
        }

        // Create user login entry
        await users_db.collection("user_login").insertOne({
            hashed_password,
            hashed_email,
        });

        // Create customer info entry
        await users_db.collection("customer_info").insertOne({
            hashed_email,
            first_name: "Vivek",
            last_name: "Admin",
            username,
            gender: "Not Specified",
            phone_number: "0000000000",
            birthday: new Date().toISOString().split('T')[0], // Today's date
            user_roles: ADMIN_ROLES
        });

        console.log("Admin user created successfully");
    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        process.exit();
    }
}

createAdminUser();
