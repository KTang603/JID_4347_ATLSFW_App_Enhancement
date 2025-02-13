import express from "express";
import cors from "cors";
import "express-async-errors";
import signup from "./routes/signup.mjs";
import bodyParser from "body-parser";
import posts from "./routes/posts.mjs";
import login from "./routes/login.mjs";
import vendor from "./routes/vendor.mjs";
import user from "./routes/user.mjs";
import password from "./routes/password.mjs";

// Replace the uri string with your MongoDB deployment's connection string.

const app = express();
const PORT = process.env.PORT || 5050;
app.use(cors());

app.use(bodyParser.json());
// Get a list of 50 posts

app.use('/login', login);
app.use(signup);
app.use(posts);
app.use(user);
app.use(vendor);
app.use('/password', password);
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occurred.");
});


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
