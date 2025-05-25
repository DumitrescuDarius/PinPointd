# Database Initialization Scripts

This directory contains scripts to help with database setup and maintenance.

## Setting Up Your Firebase Database

### Prerequisites
- Node.js installed
- Firebase project created
- Service account credentials downloaded

### Steps to Initialize Collections

1. **Download Service Account Key**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file to `firebase-service-account.json` in the root directory of your project

2. **Install Dependencies**
   ```bash
   npm install firebase-admin dotenv
   ```

3. **Run the Connection Test Script**
   ```bash
   node scripts/test-db-connection.js
   ```
   This will verify that your Firebase configuration in the .env file is correct.

4. **Run the Initialization Script**
   ```bash
   node scripts/initialize-db.js
   ```

   This will create the following collections if they don't exist:
   - `locations` - Stores pinpoint data
   - `users` - Stores user profiles
   - `notifications` - Stores user notifications
   - `chats` - Stores chat messages
   - `posts` - Stores social posts

## Troubleshooting

### Service Account Issues
If you encounter an error loading the service account:
1. Make sure the `firebase-service-account.json` file is in the root directory
2. Or set the environment variable `FIREBASE_SERVICE_ACCOUNT_PATH` to point to your service account file

### Module Type Issues
This project uses ES modules. If you encounter require/import errors:
1. Make sure the scripts have the .js extension
2. The scripts directory has its own package.json with `"type": "module"`

## Collection Structure

### locations
```
{
  name: string,
  description: string,
  coordinates: [number, number],
  tags: string[],
  photos: string[],
  createdBy: {
    uid: string,
    displayName: string,
    photoURL: string
  },
  createdAt: timestamp,
  likes: string[]  // Array of user IDs
}
```

### users
```
{
  username: string,
  email: string,
  displayName: string,
  photoURL: string,
  friends: string[],  // Array of user IDs
  pendingFriends: string[],
  blockedUsers: string[],
  createdAt: timestamp,
  lastSeen: timestamp,
  emailVerified: boolean,
  verificationCode: string  // For email verification
}
```

### notifications
```
{
  type: string,  // 'like', 'comment', 'friend_request', 'friend_accept', 'pinpoint'
  fromUser: {
    uid: string,
    displayName: string,
    photoURL: string
  },
  toUserId: string,
  read: boolean,
  createdAt: timestamp,
  locationId?: string,  // Optional, depends on notification type
  text?: string  // Optional, for comment notifications
}
```

### chats
```
{
  members: string[],  // Array of user IDs
  lastMessage: string,
  lastMessageTime: timestamp,
  lastMessageSenderId: string,
  unreadCount: number,
  isGroup: boolean,
  groupName?: string,  // For group chats
  groupPhoto?: string,  // For group chats
  createdAt: timestamp,
  createdBy: string,  // User ID
  isPinned: boolean,
  isBot: boolean  // For AI assistant chats
}
```

## Alternative: Manual Creation

You can also create these collections manually through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Firestore Database"
4. Click "Start collection" or "Create collection"
5. Create each of the collections listed above

Note: The actual documents will be created when users interact with the app. 