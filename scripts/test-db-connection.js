// Import Firebase using ES module syntax
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { getDatabase, ref, get } from 'firebase/database';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Set up dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

console.log('Testing Firebase connection...');
console.log('Firebase project:', firebaseConfig.projectId);
console.log('Database URL:', firebaseConfig.databaseURL || 'Not configured');

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');

  // Test Firestore connection
  async function testFirestore() {
    try {
      const db = getFirestore(app);
      
      // Collections to test
      const collectionsToTest = ['users', 'locations', 'notifications', 'chats', 'posts'];
      
      console.log('\nTesting Firestore collections:');
      for (const collectionName of collectionsToTest) {
        try {
          const q = query(collection(db, collectionName), limit(1));
          const querySnapshot = await getDocs(q);
          console.log(`✅ Collection '${collectionName}' exists: ${!querySnapshot.empty ? 'has documents' : 'empty'}`);
        } catch (error) {
          console.log(`❌ Error accessing collection '${collectionName}':`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
    }
  }

  // Test Realtime Database connection
  async function testRealtimeDB() {
    try {
      // Skip if no database URL is provided
      if (!firebaseConfig.databaseURL) {
        console.log('\n⚠️ Realtime Database URL not configured - skipping test');
        return;
      }
      
      const database = getDatabase(app);
      console.log('\nTesting Realtime Database connection:');
      
      try {
        // Attempt to read the .info/connected path
        const connectedRef = ref(database, '.info/connected');
        const snapshot = await get(connectedRef);
        console.log('✅ Realtime Database connected:', snapshot.exists() ? snapshot.val() : 'Connection established but value is null');
      } catch (error) {
        if (error.message.includes('Invalid token in path') || error.message.includes('permission_denied')) {
          // This could happen if the database exists but rules are strict
          console.log('✅ Realtime Database exists but may have strict security rules');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Realtime Database connection failed:', error.message);
      console.log('\n⚠️ If your app uses Realtime Database:');
      console.log('1. Make sure VITE_FIREBASE_DATABASE_URL is set correctly in your .env file');
      console.log('2. Format should be: https://your-project-id.firebaseio.com');
      console.log('3. Create a Realtime Database in Firebase Console if you haven\'t already');
    }
  }

  // Run the tests
  async function runTests() {
    await testFirestore();
    await testRealtimeDB();
    console.log('\nDatabase connection tests completed');
    
    // If all collections are empty, suggest initialization
    console.log('\nNext steps:');
    console.log('- If collections are empty, run: node scripts/initialize-db.js');
    console.log('- Update Firebase security rules if needed');
    console.log('- Start your application and test functionality');
  }

  runTests();
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
} 