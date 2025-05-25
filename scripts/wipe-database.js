const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need this file

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Add a delay function to avoid quota issues
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(100); // Reduced batch size

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  
  // Add a delay of 2 seconds between batches to avoid quota limits
  console.log(`Deleted batch of ${batchSize} documents. Waiting before next batch...`);
  await delay(2000);

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function wipeDatabase() {
  console.log('Starting database wipe with quota management...');
  
  try {
    // Get all collections
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);
    
    console.log(`Found ${collectionIds.length} collections: ${collectionIds.join(', ')}`);
    
    // Delete each collection with delays between them
    for (const collectionId of collectionIds) {
      console.log(`Deleting collection: ${collectionId}`);
      await deleteCollection(collectionId);
      console.log(`Deleted collection: ${collectionId}`);
      
      // Wait 5 seconds between collections to avoid quota issues
      console.log('Waiting 5 seconds before processing next collection...');
      await delay(5000);
    }
    
    console.log('Database wipe complete!');
  } catch (error) {
    if (error.code === 'resource-exhausted') {
      console.error('Quota exceeded. Please wait a few minutes and try again, or use the Firebase Console instead.');
    } else {
      console.error('Error wiping database:', error);
    }
  } finally {
    process.exit(0);
  }
}

wipeDatabase(); 