import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import { Query } from 'react-native-appwrite';
import { AppwriteID, databases, storage } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const TABLE_ID = 'helprequests';
const BUCKET_ID = '68d79ed4003b71ab46cd';

export type HelpRequestData = {
  userId: string;
  beneficiaryRequestCode: string;
  fullName: string;
  age: number;
  location: string;
  typeOfHelp: string;
  description: string;
  requestedAmount: number;
  paymentDetails: string;
  urgency: string;
  itemsNeeded: string[];
  evidenceFileIds?: string;
  status?: string;
};

// Upload a single evidence file
export const uploadEvidenceFile = async (file: any) => {
  try {
    // Appwrite React Native SDK expects: { name, type, size, uri }
    const appwriteFile = {
      name: file.name,
      type: file.mimeType || mime.getType(file.name) || 'application/octet-stream',
      size: file.size,
      uri: file.uri,
    };

    const response = await storage.createFile(BUCKET_ID, AppwriteID.unique(), appwriteFile);

    return response.$id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Download file by ID and save locally in React Native
export const downloadEvidenceFile = async (fileId: string, fileName: string) => {
  try {
    const fileData = await storage.getFileDownload(BUCKET_ID, fileId); // ArrayBuffer

    // Convert ArrayBuffer to Base64
    const base64Data = Buffer.from(fileData).toString('base64');

    // Save to local device
    // @ts-ignore
    const fileUri = FileSystem.documentDirectory + fileName;
    // @ts-ignore
    await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });

    return fileUri;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Create a help request document
export const createHelpRequest = async (data: HelpRequestData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TABLE_ID,
      AppwriteID.unique(),
      data
    );
    return response;
  } catch (error) {
    console.error('Error creating help request:', error);
    throw error;
  }
};

// Fetch all requests of a user
export const getUserHelpRequests = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TABLE_ID,
      [Query.equal('userId', userId)] // ✅ proper filter
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching help requests:', error);
    throw error;
  }
};

// Delete a help request
export const deleteHelpRequest = async (documentId: string) => {
  try {
    const response = await databases.deleteDocument(DATABASE_ID, TABLE_ID, documentId);
    return response;
  } catch (error) {
    console.error('Error deleting help request:', error);
    throw error;
  }
};

// Optional: update help request
export const updateHelpRequest = async (documentId: string, data: Partial<HelpRequestData>) => {
  try {
    const response = await databases.updateDocument(DATABASE_ID, TABLE_ID, documentId, data);
    return response;
  } catch (error) {
    console.error('Error updating help request:', error);
    throw error;
  }
};

