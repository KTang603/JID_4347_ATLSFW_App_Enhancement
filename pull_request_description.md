# Admin Authorization and User Management Feature

## Feature Overview
This PR implements admin authorization and user management functionality with two main components:

### 1. Authorization Backend
- Enhanced admin routes for user authorization and management
- Improved database connection handling with transactions
- Added robust error handling and logging
- Files changed:
  * `server/routes/admin.mjs` - Admin authorization endpoints
  * `server/middleware/auth.mjs` - Enhanced auth middleware
  * `server/db/conn.mjs` - Database connection improvements

### 2. User Management UI
- Added five management buttons to AdminProfile:
  * Authorize Admin - Grant admin privileges
  * Deauthorize Admin - Remove admin privileges
  * Authorize Vendor - Grant vendor privileges
  * Deauthorize Vendor - Remove vendor privileges
  * Delete User - Remove user from system
- Files changed:
  * `client/components/profile_pages/AdminProfile.js` - UI implementation

## Testing Done
- Verified all five buttons work correctly
- Confirmed changes are reflected in database
- Tested error handling and validation
- Verified proper authorization checks

## Technical Details
- Uses MongoDB transactions for atomic operations
- Implements proper error handling and logging
- Maintains session management
- Follows existing authorization patterns

## Screenshots
[Add screenshots of the new UI here]

## Notes for Reviewers
- Focus on the authorization flow in admin.mjs
- Check error handling in database operations
- Review UI feedback for user actions
