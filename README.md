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
7. Open up the `server/db/conn.mjs` file and change line 4 to your own database's URI. Do not remove the `getMongoPasscode()`.
   You will need to partition the URI like so:
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
2. Once the application is running, log in as an admin user.
3. Navigate to the News API Config screen.
4. Enter your NewsData.io API key in the provided field and click "Save".
5. You can then click "Fetch News Data" to manually trigger fetching articles from the NewsData.io API.

# Release Notes

## Version v1.0.0

## Features

#### Home Page Implementation
* Upcoming Events Section
  * Implemented section to display upcoming events from database
  * Added event cards with title, description, date and time
  * Integrated "See All" navigation to Events tab
  * Added event details modal for viewing complete event information
* Workshops & Repair Cafe Section
  * Added dedicated section for workshop events
  * Implemented workshop-specific styling and icons
  * Added filtering by workshop event type
  * Integrated with Events tab for "See All" functionality
* Featured Brands Section
  * Implemented brand cards with images and descriptions
  * Added navigation to vendor pages
  * Implemented placeholder images for missing brand assets
* Ticket Information
  * Added ticket purchase section with call-to-action
  * Implemented external link to ticket purchasing website
* Home Page Improvements
  * Added pull-to-refresh functionality
  * Implemented error handling with user-friendly messages
  * Fixed home page events display by using events_db instead of posts_db
  * Added loading indicators and empty state handling

#### Events Screen Enhancements
- **Calendar Improvements**
  - Enhanced calendar to show red dots for admin users when any user has marked interest
  - Improved date selection and event filtering
  - Added multi-dot support for event status visualization
- **Event Filtering**
  - Implemented compact toggle UI for Date/Interested sorting
  - Improved toggle button styles with light green border
  - Updated Interested filter to only show events the user has marked as interested in
  - Enhanced empty state messages with context-aware text
  - Fixed toggle visibility when filtering events
- **Event Details**
  - Enhanced event details modal with formatted date and time
  - Added support for event links and ticket URLs
  - Improved event card layout and information display
- **Event Management for Admins**
  - Implemented event editing functionality for admin users
  - Added event deletion capability for admin users
  - Created options menu for event management actions
  - Added confirmation dialog for event deletion

#### User Interface Enhancements
- **Profile Page Improvements**
  - Removed green background from profile headers for cleaner design
  - Fixed profile image positioning for better visual alignment
  - Moved settings icon from ProfileHeader to navigation header for better accessibility
  - Fixed button styling in Settings page to match profile update button
  - Added Settings section for user preferences
  - Implemented secure logout functionality
  - Enhanced user profile management
  - Added user session handling
- **Login & Registration Improvements**
  - Reordered login elements for better user flow
  - Standardized font sizes across login screens
  - Made birthday and gender fields optional in signup process
  - Fixed font issues by removing Roboto font references
- **General UI Improvements**
  - Added splash screen for better app initialization
  - Enhanced navigation with Events tab
  - Improved calendar interface for event management
  - Added responsive event cards display
  - Updated author_name to use username instead of first_name and last_name for consistency
  - Updated article image styling to match shop image styling for visual coherence

#### News Feed Integration
- **Article Management**
  - Implemented article filtering by tags
  - Added infinite scroll pagination
  - Created like/save functionality for articles
  - Added article preview with image support
  - Implemented article metrics tracking (likes, saves)
  - Made all fields compulsory for article creation to ensure data integrity
  - Enhanced search functionality in news feed
  - Added tags to search functionality for more precise content filtering
- **API Integration**
  - Integrated NewsData.io API for fetching sustainable fashion articles
  - Added API key and search query configuration in admin panel
  - Implemented secure per-request API key handling
  - Created article fetching script with customizable search parameters

#### Admin Features
- **User Management**
  - Implemented three dots menu for user actions in AdminDataListScreen
  - Added vendor confirmation workflow
  - Enhanced user activation and deactivation functionality
  - Improved admin data list display and interaction
  - Added admin authorization system
  - Implemented user management features
  - Added vendor authorization controls
  - Created vendor status verification system
  - Added vendor deauthorization with status checks

## Bug Fixes

#### Authentication & User Management
- Prevented duplicate alerts when handling deactivated user accounts
- Fixed navigation issues with deactivated accounts
- Added proper handling for account activation and deactivation
- Enhanced NewsFeedScreen to fetch data on load ensuring deactivated users are logged out
- Fixed token expiration handling
- Improved error messages for authentication failures
- Added proper token refresh mechanism

#### UI Fixes
- Fixed toggle visibility in EventsScreen when no events match filters
- Improved empty state messages to differentiate between no events and filtered results
- Fixed font rendering issues across multiple screens
- Fixed button styling inconsistencies
- Fixed screen transition bugs
- Corrected navigation stack handling
- Improved error handling in navigation

#### Data Handling
- Fixed home page events display by using events_db instead of posts_db
- Added proper error handling for API requests
- Improved date and time formatting for events
- Enhanced data loading and refresh mechanisms
- Fixed event creation validation
- Improved error handling for event operations
- Ensured event retrieval is restricted to authenticated users

#### Recent Fixes
- **Fixed Event Interested List Crash**: Resolved issue where the app would crash when viewing the interested users list for an event if any participants had been deleted or deactivated. Added filtering on both server and client sides to prevent "cannot read property 'first_name' of null" and "cannot read property '_id' of null" errors.
- **Fixed Article Creation Issues**: 
  - Fixed user ID retrieval in NewsApiDetailsScreen
  - Added validation for author_id
  - Added publishDate and createdAt fields to article creation
- **Fixed Event Interest UI Update**: Updated selectedEvent state immediately after clicking Interested button for better user experience
- **Fixed Webview Loading Indicators**: Improved to match app style and enhance performance
- **Fixed Purchase Tickets Button**: Updated to directly open ticket URL for seamless user experience
- **Fixed API Integration Issues**:
  - Removed stored API key vulnerability
  - Fixed article duplication issues
  - Improved error handling for API requests

## Known Issues
- No event analytics or metrics functionality
- No purchase tracking or recommendations
- Event card layout could be more responsive
- Date picker could have more customization options
- Initial article load time could be improved
- API response handling could be more efficient

## Team Links
1. Github: https://github.com/KTang603/JID_4347_ATLSFW_App_Enhancement
2. Original App Github: https://github.com/sanav33/atlsfw_jd
3. Jira: https://gatech-team-sqodvrme.atlassian.net/jira/software/projects/SCRUM/boards/1
