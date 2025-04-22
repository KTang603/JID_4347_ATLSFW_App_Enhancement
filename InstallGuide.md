# Enhanced ATLSFW Mobile Application 🌿

The **Enhanced ATLSFW Mobile Application** builds upon the original app's mission of engaging users with sustainable fashion. This version establishes a foundation for future upgrades while preserving its core focus on user education and interaction through articles and community-driven features.

# Installation Guide

## Prerequisites
* MacOS or Linux Laptop connected to a secured wi-fi connection
* iPhone connected to the same network
* Docker Desktop (installation instructions for [Mac OS](https://docs.docker.com/desktop/install/mac-install/) and [Linux](https://docs.docker.com/desktop/install/linux-install/))
* NodeJS (install [here](https://nodejs.org/en/download))
* An IDE (we recommend [VSCode](https://code.visualstudio.com/download))
* A Terminal (pre-installed on Mac OS and Linux)
* Git (installation instructions [here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
* Expo Go App (available on the App Store) and account

## Setting up the database
1. Create a MongoDB Atlas account [here](https://www.mongodb.com/cloud/atlas/register) and login.
2. Navigate to the **Database** tab under the **Deployment** section in the left sidebar.
3. Click on the **Collections** tab.
4. Create the following databases and collections:
   - `events` database with `events` collection
   - `posts` database with `articles`, `liked_articles`, and `saved_articles` collections
   - `third_party` database with `config` collection
   - `users` database with `customer_info`, `user_login`, and `vendor_info` collections
5. Navigate back to the **Overview** tab and click the **Connect** button and then click the **Drivers** option.
6. Copy the URI 
7. Open up the `server/db/conn.mjs` file and change to your own database's URI. Do not remove the `getMongoPasscode()`.
### Running commands in the Terminal
To run a command in your terminal, type in the command and press Enter.

## Setting up the app
1. Open up a terminal window and clone the repository using the following command:

```git clone https://github.com/KTang603/JID_4347_ATLSFW_App_Enhancement.git```

2. Open the cloned repository using VSCode and open up a terminal session in VSCode using ``Ctrl + Shift + ` `` (final character is a backtick).
3. Create a `password.mjs` file in the `server` folder with the MongoDB Atlas credentials:
   ```javascript
   // MongoDB Atlas credentials
   export default function getMongoPasscode() {
       return "your_mongodb_username:your_mongodb_password";
   }
   ```

## Setting up the server
1. Open up a second terminal window in the cloned repository within VSCode.
2. Run `cd server` in the terminal to change the directory to the `server` directory.
3. Run `npm install` to install all the required dependencies.
4. Open Docker Desktop and leave it running in the background.
5. Run `./run_server.sh`. You should see `Server is running on port: 5050`.

### Docker Configuration
The application uses Docker to containerize the server environment, ensuring consistent behavior across different development and deployment environments. When you run `./run_server.sh`, the script:

1. Builds a Docker image using the Dockerfile in the server directory
2. Creates and starts a Docker container with the following configuration:
   - Maps port 5050 on your host machine to port 5050 in the container
   - Mounts the server directory as a volume in the container for live code updates
   - Sets up the Node.js environment with all dependencies
   - Runs the server application inside the container

The Dockerfile includes:
- Node.js as the base image
- Installation of all dependencies from package.json
- Configuration of the working directory
- Exposure of port 5050
- Command to start the server

This containerization ensures that the server runs in a consistent environment regardless of the host machine's configuration.

## Setting up client
1. Open up a second terminal window in the cloned repository within VSCode.
2. Run `cd client` in the terminal to change the directory to the `client` directory.
3. Run `npm install` to install all the required dependencies.
4. Open up the Expo Go app on your phone.
5. Run `npx expo login` in your terminal and login using your Expo Go account credentials (you only have to do this the first time you run the app).
6. Run `npx expo start`
7. Run `./run_client.sh`. The app instance will show up in the Expo Go app.

## News API Setup
1. Create an account on [NewsData.io](https://newsdata.io/) and get your API key.
2. Once the application is running, log in as an admin user (instructions below).
3. Navigate to the News API Config screen.
4. Enter your NewsData.io API key in the provided field and click "Save".
5. You can then click "Fetch News Data" to manually trigger fetching articles from the NewsData.io API.

## User Roles and Permissions
The application supports three different user roles, each with different permissions:

1. Singup only creates a 'Regular User'. Relugar user can be converted through Admin account settings page or by changing it in the database.

2. **Regular User** (`user_roles: 1`)
   - Can view events and articles
   - Can mark interest in events
   - Can like and save articles
   - Can update their own profile information
   - Cannot create or modify events
   - Cannot access admin features

3. **Vendor** (`user_roles: 2`)
   - All regular user permissions
   - Can create and manage their own shop page
   - Can add products and services
   - Can update their vendor profile
   - Cannot create or modify events
   - Cannot access admin features

4. **Admin** (`user_roles: 3`)
   - Full access to all features
   - Can create, edit, and delete events
   - Can manage all users (activate/deactivate accounts)
   - Can make a regular user to Vendor
   - Can approve/reject vendor applications
   - Can configure the News API
   - Can access all admin screens and features

### Setting Up User Roles
When creating users in the MongoDB database, set the `user_roles` field in the `user_login` collection to:
- `1` for regular users
- `2` for vendors
- `3` for admin users

Example MongoDB document for an admin user:
```javascript
{
  "_id": ObjectId("..."),
  "email": "admin@example.com",
  "password": "hashed_password",
  "user_roles": 3,
  ....
  ....
}
```
