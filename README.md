# Enhanced ATLSFW Mobile Application 🌿

The **Enhanced ATLSFW Mobile Application** builds upon the original app's mission of engaging users with sustainable fashion. This version establishes a foundation for future upgrades while preserving its core focus on user education and interaction through articles and community-driven features.


# Release Notes

## Version v0.4.0

### Features

#### 1. Home Page Implementation
- **Upcoming Events Section**
  - Implemented section to display upcoming events from database
  - Added event cards with title, description, date and time
  - Integrated "See All" navigation to Events tab
  - Added event details modal for viewing complete event information
- **Workshops & Repair Cafe Section**
  - Added dedicated section for workshop events
  - Implemented workshop-specific styling and icons
  - Added filtering by workshop event type
  - Integrated with Events tab for "See All" functionality
- **Featured Brands Section**
  - Implemented brand cards with images and descriptions
  - Added navigation to vendor pages
  - Implemented placeholder images for missing brand assets
- **Ticket Information**
  - Added ticket purchase section with call-to-action
  - Implemented external link to ticket purchasing website
- **Home Page Improvements**
  - Added pull-to-refresh functionality
  - Implemented error handling with user-friendly messages
  - Fixed home page events display by using events_db instead of posts_db
  - Added loading indicators and empty state handling

#### 2. Events Screen Enhancements
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

#### 3. User Interface Enhancements
- **Profile Page Improvements**
  - Removed green background from profile headers for cleaner design
  - Fixed profile image positioning for better visual alignment
  - Moved settings icon from ProfileHeader to navigation header for better accessibility
  - Fixed button styling in Settings page to match profile update button
- **Login & Registration Improvements**
  - Reordered login elements for better user flow
  - Standardized font sizes across login screens
  - Made birthday and gender fields optional in signup process
  - Fixed font issues by removing Roboto font references

#### 4. Admin Features
- **User Management**
  - Implemented three dots menu for user actions in AdminDataListScreen
  - Added vendor confirmation workflow
  - Enhanced user activation and deactivation functionality
  - Improved admin data list display and interaction

### Bug Fixes

#### 1. Authentication & User Management
- Prevented duplicate alerts when handling deactivated user accounts
- Fixed navigation issues with deactivated accounts
- Added proper handling for account activation and deactivation
- Enhanced NewsFeedScreen to fetch data on load ensuring deactivated users are logged out

#### 2. UI Fixes
- Fixed toggle visibility in EventsScreen when no events match filters
- Improved empty state messages to differentiate between no events and filtered results
- Fixed font rendering issues across multiple screens
- Fixed button styling inconsistencies

#### 3. Data Handling
- Fixed home page events display by using events_db instead of posts_db
- Added proper error handling for API requests
- Improved date and time formatting for events
- Enhanced data loading and refresh mechanisms
     
### Known Issues

#### 1. Event Management
- No event analytics or metrics

### Coming in Future Releases

#### 1. Shop Page Implementation
- Vendor/Designer shop page for marketing their products
- Product catalog and browsing functionality
- Vendor profile customization

#### 2. Additional Improvements
- Enhanced vendor integration features
- More customization options for user profiles


## Version v0.3.0
### Features
1. Profile Page Improvements
    - Added Settings section for user preferences
    - Implemented secure logout functionality
    - Enhanced user profile management
    - Added user session handling

2. Events Management
    - Created new Events tab with calendar integration
    - Implemented event creation for admin users
    - Added event display with detailed view for all user profiles
    - Integrated date picker for event scheduling
    - Added event filtering by date

3. UI/UX Improvements
    - Added splash screen for better app initialization
    - Enhanced navigation with Events tab
    - Improved calendar interface for event management
    - Added responsive event cards display


### Bug Fixes
1. Authentication Issues
    - Fixed token expiration handling
    - Improved error messages for authentication failures
    - Added proper token refresh mechanism

2. Navigation Improvements
    - Resolved navigation stack issues
    - Fixed screen transition bugs
    - Improved Events tab integration

3. Event Management
    - Fixed event creation validation
    - Improved error handling for event operations
    - Ensured event retrieval is restricted to authenticated users (Get /events now requres JWT)
    - Enhanced date selection functionality
 
### Known Issues
1. Calendar Interface
    - Calendar width adjustment needs optimization
    - Event card layout could be more responsive
    - Date picker could have more customization options

2. Event Management
    - No event editing functionality
    - No event deletion feature
    - Event search functionality not implemented
    - No event analytics or metrics
    - Event analytics missing

3. Performance
    - Calendar rendering needs optimizing
    - Event loading could be more efficient
    - Date picker response time could be improved

4. Previous Defects / Challenges
    - Token Implementation
    - Needed secure token storage solution
    - Had to implement proper token validation

5. Calendar Integration
    - Required specific date formatting
    - Needs proper event data structure

7.  Shopping Discourse
    - No integrated marketplace or vender listings
    - Limited vendor-user interaction
    - No purchase tracking or recommendations
  

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


## Version 0.1.0

### Features
1. News Feed Integration
   - Integrated the NewsData.io API to fetch sustainable fashion articles.
   - Added API key and search query configuration in the admin panel.
   - Implemented secure per-request API key handling to enhance security.
   - Created a customizable article fetching script with support for search parameters.
2. Navigation and UI Enhancements
   - Renamed and redesigned the "Community" tab to "News Feed" for better clarity.
   - Added placeholder tabs for upcoming "Home" and "Events" features.
   - Updated the navigation bar with intuitive icons and improved responsiveness.
   - Implemented a responsive grid layout for article display.
3. Admin Controls
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
