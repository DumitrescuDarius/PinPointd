// Import Firebase admin SDK with ES module syntax
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Set up dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize Firebase Admin with service account
try {
  // Get service account path from environment variable or use default path
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || resolve(__dirname, '../firebase-service-account.json');
  
  // Read the service account file
  const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountFile);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

// Collections to initialize
const collections = [
  'locations',
  'users',
  'notifications',
  'chats',
  'posts'
];

// Function to initialize collections
async function initializeCollections() {
  try {
    for (const collectionName of collections) {
      // Check if collection exists by trying to get a document from it
      const snapshot = await db.collection(collectionName).limit(1).get();
      
      if (snapshot.empty) {
        // Collection doesn't exist or is empty, create it with a dummy document
        const dummyDocRef = db.collection(collectionName).doc('_dummy_');
        await dummyDocRef.set({
          _initialized: true,
          _timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Delete the dummy document right away
        await dummyDocRef.delete();
        
        console.log(`Collection '${collectionName}' initialized`);
      } else {
        console.log(`Collection '${collectionName}' already exists`);
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
  } finally {
    // Terminate the Firebase Admin app
    await admin.app().delete();
  }
}

// Run the initialization
initializeCollections(); 