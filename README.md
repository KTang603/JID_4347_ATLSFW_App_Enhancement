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
- Fixed EventsScreen toggle not displaying correctly when no events matched filters
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
2. Install Guide: https://github.com/KTang603/JID_4347_ATLSFW_App_Enhancement/blob/main/InstallGuide.md#installation-guide
3. Github of Original App: https://github.com/sanav33/atlsfw_jd
4. Team Jira: https://gatech-team-sqodvrme.atlassian.net/jira/software/projects/SCRUM/boards/1
