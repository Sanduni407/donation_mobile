// lib/donorPreferences.ts
import { Query } from 'react-native-appwrite';
import { AppwriteID, databases } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const PREFERENCES_TABLE_ID = 'donorpreferences';

export type DonorPreference = {
  $id?: string;
  userId: string;
  preferences: string[];
  updatedAt: string;
};

// Get donor preferences by user ID
export const getDonorPreferences = async (userId: string): Promise<DonorPreference | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PREFERENCES_TABLE_ID,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as DonorPreference;
    }
    return null;
  } catch (error) {
    console.error('Error fetching donor preferences:', error);
    throw error;
  }
};

// Create donor preferences
export const createDonorPreferences = async (
  userId: string,
  preferences: string[]
): Promise<DonorPreference> => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      PREFERENCES_TABLE_ID,
      AppwriteID.unique(),
      {
        userId,
        preferences,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as DonorPreference;
  } catch (error) {
    console.error('Error creating donor preferences:', error);
    throw error;
  }
};

// Update donor preferences
export const updateDonorPreferences = async (
  preferenceId: string,
  preferences: string[]
): Promise<DonorPreference> => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      PREFERENCES_TABLE_ID,
      preferenceId,
      {
        preferences,
        updatedAt: new Date().toISOString(),
      }
    );
    return response as unknown as DonorPreference;
  } catch (error) {
    console.error('Error updating donor preferences:', error);
    throw error;
  }
};

// Save or update preferences (checks if exists first)
export const saveDonorPreferences = async (
  userId: string,
  preferences: string[]
): Promise<DonorPreference> => {
  try {
    const existing = await getDonorPreferences(userId);
    
    if (existing && existing.$id) {
      return await updateDonorPreferences(existing.$id, preferences);
    } else {
      return await createDonorPreferences(userId, preferences);
    }
  } catch (error) {
    console.error('Error saving donor preferences:', error);
    throw error;
  }
};