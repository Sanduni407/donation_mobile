// lib/appwrite.ts
import { Account, Client, Databases, Functions, ID, Storage } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

// Replace these with values from your Appwrite console
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '68d43c4e0000ac29ecc0';
const PLATFORM = 'com.zan.donation';

// IMPORTANT: Replace 'your_database_id' with your actual Database ID from Appwrite Console
// To find it: Appwrite Console → Databases → Click your database → Copy "Database ID"
// It should look like: '674abc123def456789' (alphanumeric string)
const DATABASE_ID = '68d797e8002551ac5a86'; // ← REPLACE THIS!

// Optional: Translation cache collection ID (can be created later)
const TRANSLATION_CACHE_COLLECTION_ID = 'translation_cache';

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setPlatform(PLATFORM);

export const account = new Account(client);
export const AppwriteID = ID;
export const functions = new Functions(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export config for use in other files
export const appwriteConfig = {
  endpoint: ENDPOINT,
  projectId: PROJECT_ID,
  platform: PLATFORM,
  databaseId: DATABASE_ID,
  translationCacheCollectionId: TRANSLATION_CACHE_COLLECTION_ID,
};

export default client;