import express from "express";
import { posts_db, users_db } from "../db/conn.mjs";
import { ACTIVATE_STATUS, USER_ROLES } from "../utils/constant.mjs";

/*
enum AccountType {
  Vendor,
  Admin,
  General,
}
*/

const router = express.Router();

router.post("/signup", async (req, res) => {
  const {
    hashed_email,
    hashed_password,
    first_name,
    last_name,
    username,
    birthday,
    gender,
    phone_number,
    user_email,
  } = req.body;
  if (!hashed_email || !hashed_password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email or password" });
  }

  const existingUser = await users_db
    .collection("user_login")
    .findOne({ hashed_email: hashed_email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }
  if (
    first_name == null ||
    last_name == null ||
    username == null ||
    birthday == null ||
    gender == null ||
    phone_number == null ||
    user_email == null
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing certain attributes" });
  }
  await users_db
    .collection("user_login")
    .insertOne({
      hashed_password: hashed_password,
      hashed_email: hashed_email,
    });
  await users_db.collection("customer_info").insertOne({
    hashed_email: hashed_email,
    first_name: first_name,
    last_name: last_name,
    username: username,
    gender: gender,
    phone_number: phone_number,
    birthday: birthday,
    user_email:user_email,
    user_status:ACTIVATE_STATUS,
    user_roles: USER_ROLES, // 1 for user, 2 for admin
    // encrypted_email: encrypted_email,
    // liked_articles: [],
    // saved_articles: []
  });

  const userInfo = await users_db
    .collection("customer_info")
    .findOne({ hashed_email: hashed_email });
  res.status(200).json({ success: true, user: userInfo });
});
// Get a list of 50 posts
/*
router.post("/", async (req, res) => {
    console.log("got a signup request");
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        return res.status(399).json({ success: false, message: 'Missing email or password' });
    }
    const existingUser = await users_db.collection('user_login').findOne({ hashed_email: email });
    if (existingUser) {
        res.send(results).status(399).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 9);
    await users_db.collection('user_login').insertOne({ password_hashed: hashedPassword, account_type: 0, hashed_email: bcrypt.hash(email, 10) });
    res.json({ success: true });

});

*/
export default router;
