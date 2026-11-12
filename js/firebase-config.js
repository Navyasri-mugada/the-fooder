/**
 * Firebase Firestore Configuration & Data Service for The Fooder
 * 
 * INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a project and enable "Cloud Firestore" in Test Mode.
 * 3. Click the Web icon (</>) to register a web app and copy your firebaseConfig.
 * 4. Paste your keys below into the `firebaseConfig` object!
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db = null;
let firebaseInitialized = false;

// Initialize Firebase if user has provided their real config
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log("🔥 Firebase Firestore connected successfully to The Fooder!");
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to LocalStorage:", error);
  }
} else {
  console.log("ℹ️ Firebase config is in demo mode. Running with local browser storage. Update js/firebase-config.js with your keys to enable cloud sync.");
}

/**
 * Saves a placed food order to Firestore 'orders' collection
 */
async function saveOrderToFirebase(orderData) {
  if (!firebaseInitialized || !db) {
    return { success: true, mode: 'local' };
  }
  try {
    const docRef = await db.collection("orders").add({
      ...orderData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Order saved to Firestore with ID: ", docRef.id);
    return { success: true, mode: 'firestore', id: docRef.id };
  } catch (err) {
    console.error("Error saving order to Firestore:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a table reservation to Firestore 'bookings' collection
 */
async function saveBookingToFirebase(bookingData) {
  if (!firebaseInitialized || !db) {
    return { success: true, mode: 'local' };
  }
  try {
    const docRef = await db.collection("bookings").add({
      ...bookingData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Booking saved to Firestore with ID: ", docRef.id);
    return { success: true, mode: 'firestore', id: docRef.id };
  } catch (err) {
    console.error("Error saving booking to Firestore:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a guest review to Firestore 'reviews' collection
 */
async function saveReviewToFirebase(reviewData) {
  if (!firebaseInitialized || !db) {
    return { success: true, mode: 'local' };
  }
  try {
    const docRef = await db.collection("reviews").add({
      ...reviewData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Review saved to Firestore with ID: ", docRef.id);
    return { success: true, mode: 'firestore', id: docRef.id };
  } catch (err) {
    console.error("Error saving review to Firestore:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent reviews from Firestore
 */
async function fetchReviewsFromFirebase() {
  if (!firebaseInitialized || !db) {
    return null;
  }
  try {
    const snapshot = await db.collection("reviews").orderBy("createdAt", "desc").limit(30).get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (err) {
    console.warn("Could not fetch reviews from Firestore:", err);
    return null;
  }
}
