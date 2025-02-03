import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let credential;

    // Try to get service account from env var
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
      credential = admin.credential.cert(serviceAccount);
      console.log('Using Firebase service account from environment variable');
    }
    // Try to use application default credentials
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
      console.log('Using application default credentials');
    }
    // Fall back to a local service account file
    else {
      try {
        const serviceAccount = require('../../../firebase-service-account.json');
        credential = admin.credential.cert(serviceAccount);
        console.log('Using local firebase-service-account.json file');
      } catch (e) {
        console.log('No local service account file found, initializing without credentials');
        credential = admin.credential.applicationDefault();
      }
    }

    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'project-management-app'
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const auth = admin.auth();
export const app = admin.app();
