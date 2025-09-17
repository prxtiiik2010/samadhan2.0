import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported as analyticsIsSupported, Analytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration is read from Vite env variables.
// Ensure you define these in a .env file with the Vite prefix VITE_.
// Example values are provided in `.env.example` at the project root.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || undefined,
  databaseURL: (import.meta.env.VITE_FIREBASE_DATABASE_URL as string) || undefined,
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const firebaseApp = app;
export const auth = getAuth(app);
// Use initializeFirestore with auto-detected long polling to avoid blocked channel errors
export const db = initializeFirestore(app, {
  // Tries to detect when to prefer long-polling (works around ad-blockers/corporate proxies)
  experimentalAutoDetectLongPolling: true,
});
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

let analytics: Analytics | undefined;
// Initialize Analytics only in browsers where it's supported
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  analyticsIsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };


