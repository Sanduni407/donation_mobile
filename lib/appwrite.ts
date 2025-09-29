// lib/appwrite.ts
import { Account, Client, Databases, Functions, ID, Storage } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

// Replace these with values from your Appwrite console
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1'; // e.g. https://cloud.appwrite.io/v1
const PROJECT_ID = '68d43c4e0000ac29ecc0';
const PLATFORM = 'com.zan.donation'; // optional but good for Appwrite console

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setPlatform(PLATFORM);

export const account = new Account(client);
export const AppwriteID = ID; // if you need ID.unique()
export const functions = new Functions(client);

export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;



