# Enhanced ATLSFW Mobile Application 🌿

The **Enhanced ATLSFW Mobile Application** expands on the original app's mission to engage users with sustainable fashion. This version introduces a foundation for future enhancements while retaining the core functionality of user education and engagement through articles and community features.

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
4. Use the **Create Database** button to create two databases: `posts` and `users`.
5. Within the `posts` database, create one collection: `articles`.
6. Within the `users` database, create three collections: `vendor_info`, `customer_info`, and `user_login`.

The final structure of your database should look like this:


<img src="./db.png" alt="DB Structure" width="200"/>

7. Finally, navigate back to the **Overview** tab and click the **Connect** button and then click the **Drivers** option.
8. Copy the URI as shown below:


<img src="./uri.png" alt="db uri" width="700"/>


10. Open up the `server/db/conn.mjs` file and change line 4 to your own database's URI. Do not remove the `getMongoPasscode()`.
    You will need to partition the URI like so:


<img src="./conn.png" alt="db uri" width="800"/>

### Running commands in the Terminal
To run a command in your terminal, type in the command and press Enter.

## Setting up the app
1. Open up a terminal window and clone the repository using the following command:

```git clone https://github.com/sanav33/atlsfw_jd.git```

2. Open the cloned repository using VSCode and open up a terminal session in VSCode using ``Ctrl + Shift + ` `` (final character is a backtick).
3. Create a `password.mjs` file in the `server` folder with the MongoDB Atlas credentials and the private key
   for the encryption utilities (these credentials will be securely delivered to the client in person).

You can use the "New File" button in the VSCode File Explorer shown below to create the file.


<img src="./new_file.png" alt="New File" width="200"/>


## Setting up the server
1. Open up a second terminal window in the cloned repository within VSCode.
2. Run `cd server` in the terminal to change the directory to the `server` directory.
3. Open Docker Desktop and leave it running in the background.
4. Run `./run_server.sh`. You should see `Server is running on port: 5050`.

## Setting up client
1. Open up a second terminal window in the cloned repository within VSCode.
2. Run `cd client` in the terminal to change the directory to the `client` directory.
4. Run `npm install`.
5. Open up the Expo Go app on your phone.
6. Run `npx expo login` in your terminal and login using your Expo Go account credentials (you only have to do this the first time you run the app).
7. Run `npx expo start`
8. Run `./run_client.sh`. The app instance will show up in the Expo Go app.

# Release Notes

# ATLSFW News Feed

ATLSFW News Feed is a sustainable fashion news aggregator that provides curated articles from various sources, focusing on sustainable fashion trends, innovations, and industry updates. The application features a modern, user-friendly interface with robust admin controls and user management capabilities.

# Release Notes

## Version v0.2.0

### Features
1. News Feed Integration
   - Integrated NewsData.io API for fetching sustainable fashion articles
   - Added API key and search query configuration in admin panel
   - Implemented secure per-request API key handling
   - Created article fetching script with customizable search parameters

2. Navigation and UI Enhancements
   - Renamed and redesigned Community tab to News Feed for better clarity
   - Added placeholder tabs for Home and Events features
   - Implemented News Feed as the central content hub
   - Updated navigation bar with intuitive icons
   - Added responsive grid layout for article display

3. Admin Controls
   - Added admin authorization system
   - Implemented user management features
   - Added vendor authorization controls
   - Created vendor status verification system
   - Added vendor deauthorization with status checks

4. Article Management
   - Implemented article filtering by tags
   - Added infinite scroll pagination
   - Created like/save functionality for articles
   - Added article preview with image support
   - Implemented article metrics tracking (likes, saves)

### Bug Fixes
1. Fixed vendor deauthorization issue
   - Added status check before deauthorization
   - Implemented proper error handling
   - Added user feedback for authorization status

2. Resolved navigation issues
   - Fixed screen transition bugs
   - Corrected navigation stack handling
   - Improved error handling in navigation

3. Improved API integration
   - Removed stored API key vulnerability
   - Fixed article duplication issues
   - Improved error handling for API requests

### Known Issues
1. Navigation
   - Home and Events tabs are currently placeholders
   - Some navigation transitions could be smoother

2. Article Management
   - Article preview images sometimes fail to load
   - Tag filtering could be more responsive
   - Search functionality needs optimization

3. Admin Features
   - Bulk user management features not yet implemented
   - No ability to see user email id
   - No automated content moderation

4. Performance
   - Initial article load time could be improved
   - API response handling could be more efficient

### Previous Defects / Challenges
1. Application Setup
   - Had to configure and set up the React Native environment
   - Required specific Node.js version compatibility
   - Needed to install and configure various dependencies
   - Had to set up development environment variables

2. Database Configuration
   - Had to set up and configure MongoDB database
   - Required proper connection string setup

***

## Version 0.1.0

### Features
- News Feed Integration
   - Integrated the NewsData.io API to fetch sustainable fashion articles.
   - Added API key and search query configuration in the admin panel.
   - Implemented secure per-request API key handling to enhance security.
   - Created a customizable article fetching script with support for search parameters.
- Navigation and UI Enhancements
   - Renamed and redesigned the "Community" tab to "News Feed" for better clarity.
   - Added placeholder tabs for upcoming "Home" and "Events" features.
   - Updated the navigation bar with intuitive icons and improved responsiveness.
   - Implemented a responsive grid layout for article display.
- Admin Controls
   - Added an admin authorization system for user and vendor management.
   - Implemented vendor status verification and deauthorization with proper error handling.



### Bug Fixes
- None in this release.

### Known Issues
N/A

### Troubleshooting
N/A

**NOTE:**


## Team Links
1. Github: https://github.com/KTang603/JID-4347-ATLSFW-App-Enhancement
2. Original App Github: https://github.com/sanav33/atlsfw_jd
3. Jira: https://gatech-team-sqodvrme.atlassian.net/jira/software/projects/SCRUM/boards/1
