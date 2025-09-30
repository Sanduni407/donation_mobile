// lib/donations.ts
import { AppwriteID, databases } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const DONATIONS_TABLE_ID = 'donations'; // Create this table in Appwrite
const POSTS_TABLE_ID = 'beneficiaryposts';

export type DonationData = {
  donorId: string;
  postId: string;
  beneficiaryRequestCode: string;
  amountLKR: number;
  amountUSD: number;
  paymentIntentId: string;
  paymentStatus: 'succeeded' | 'failed' | 'pending';
  donorName: string;
  beneficiaryName: string;
};

// Convert LKR to USD (approximate rate, you can make this dynamic)
export const convertLKRtoUSD = (amountLKR: number): number => {
  const exchangeRate = 0.0031; // 1 LKR ≈ 0.0031 USD (update as needed)
  return Math.round(amountLKR * exchangeRate * 100) / 100; // Round to 2 decimals
};

// Convert USD to LKR
export const convertUSDtoLKR = (amountUSD: number): number => {
  const exchangeRate = 320; // 1 USD ≈ 320 LKR (update as needed)
  return Math.round(amountUSD * exchangeRate * 100) / 100;
};

// Create a donation record
export const createDonation = async (data: DonationData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      DONATIONS_TABLE_ID,
      AppwriteID.unique(),
      {
        ...data,
        createdAt: new Date().toISOString(),
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

// Update beneficiary post collected amount
export const updateCollectedAmount = async (postId: string, donationAmount: number) => {
  try {
    // First, get the current post to get the current collected amount
    const currentPost = await databases.getDocument(
      DATABASE_ID,
      POSTS_TABLE_ID,
      postId
    );

    const currentCollected = currentPost.collectedAmount || 0;
    const newCollected = currentCollected + donationAmount;

    // Update the post with new collected amount
    const response = await databases.updateDocument(
      DATABASE_ID,
      POSTS_TABLE_ID,
      postId,
      {
        collectedAmount: newCollected,
      }
    );

    return response;
  } catch (error) {
    console.error('Error updating collected amount:', error);
    throw error;
  }
};

// Get donations by donor ID
export const getDonationsByDonor = async (donorId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      DONATIONS_TABLE_ID,
      [
        // Filter by donorId - Appwrite Query syntax
        `donorId="${donorId}"`,
      ]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching donor donations:', error);
    throw error;
  }
};

// Get single donation by ID
export const getDonationById = async (donationId: string) => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      DONATIONS_TABLE_ID,
      donationId
    );
    return response;
  } catch (error) {
    console.error('Error fetching donation:', error);
    throw error;
  }
};