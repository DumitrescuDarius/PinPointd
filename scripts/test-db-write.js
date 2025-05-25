// Script to test writing to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Set up dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testWrite() {
  console.log('Testing write access to Firestore...');
  console.log('Firebase project:', firebaseConfig.projectId);
  
  try {
    // Create a test document in the locations collection
    const testDoc = {
      name: 'Test Location',
      description: 'This is a test document to verify database write access',
      coordinates: [0, 0],
      tags: ['test'],
      photos: [],
      createdBy: {
        uid: 'test-user',
        displayName: 'Test User',
        photoURL: null
      },
      createdAt: serverTimestamp(),
      _isTestDocument: true
    };
    
    console.log('Attempting to create test document...');
    const docRef = await addDoc(collection(db, 'locations'), testDoc);
    console.log('✅ Test document created successfully with ID:', docRef.id);
    
    // Delete the test document
    console.log('Cleaning up - Deleting test document...');
    await deleteDoc(doc(db, 'locations', docRef.id));
    console.log('✅ Test document deleted successfully');
    
    console.log('\n🎉 Database write test completed successfully!');
    console.log('Your database is properly configured for writing data.');
    return true;
  } catch (error) {
    console.error('❌ Database write test failed:', error.message);
    console.log('\nPossible reasons:');
    console.log('1. Incorrect Firebase configuration');
    console.log('2. Insufficient permissions - check your Firestore security rules');
    console.log('3. Network connectivity issues');
    return false;
  }
}

// Run the test
testWrite().then(() => {
  console.log('\nAll tests completed.');
}).catch(error => {
  console.error('Unexpected error:', error);
}); 