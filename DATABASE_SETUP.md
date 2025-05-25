# Setting Up Your New Firebase Database

This guide will help you set up and configure your new Firebase database for the PinPointd application.

## Prerequisites

- Node.js installed
- Firebase project created with Firestore and Realtime Database
- Updated `.env` file with your new Firebase configuration

## Quick Setup

1. **Verify Database Connection**
   ```
   node scripts/test-db-connection.js
   ```
   This will check if your Firebase configuration is correct and if the required collections exist.

2. **Test Write Access**
   ```
   node scripts/test-db-write.js
   ```
   This will test if your application can write to the database by creating and then deleting a test document.

3. **Initialize Database Collections**
   ```
   node scripts/initialize-db.js
   ```
   This will ensure all required collections exist in your Firestore database.

## Manual Setup (Alternative)

If you prefer to set up the database manually through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Firestore Database"
4. Create the following collections:
   - `locations` - Stores pinpoints
   - `users` - Stores user profiles
   - `notifications` - Stores notifications
   - `chats` - Stores chat messages
   - `posts` - Stores social posts

## Verify Security Rules

Make sure your Firestore security rules allow the necessary read and write operations:

1. Go to Firebase Console > Firestore Database > Rules
2. Update the rules to match your security requirements (start with test mode for initial testing)

Example rules for testing:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Important**: These rules allow full access to your database. Update them with proper authentication rules before deploying to production.

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check your `.env` file to ensure VITE_FIREBASE_API_KEY is correctly set

### Error: "Missing or insufficient permissions"
- Check your Firestore security rules to ensure proper access

### Cannot connect to Realtime Database
- Ensure VITE_FIREBASE_DATABASE_URL is correctly set in your `.env` file
- Create a Realtime Database in Firebase Console if you haven't already

## Next Steps

Once your database is properly set up:

1. Start your application
2. Register a new user (the first user will be created in your new database)
3. Create a pinpoint to test the core functionality
4. Test the chat system

Your application should now be fully functional with the new database! 