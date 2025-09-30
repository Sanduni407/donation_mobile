import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { AppwriteID, databases, storage } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const HELP_REQUESTS_TABLE_ID = 'helprequests';
const POSTS_TABLE_ID = 'beneficiaryposts';
const BUCKET_ID = '68d79ed4003b71ab46cd'; // Same bucket for both evidence files and post images

export type BeneficiaryPostData = { 
  helpRequestId: string;
  beneficiaryRequestCode: string;
  beneficiaryName: string;
  description: string;
  itemsNeeded: string[];
  goalAmount: number; // float - supports decimals like 1250.50
  urgencyLevel: string;
  typeOfHelp: string;
  collectedAmount?: number; // float - supports decimals like 327.75
  status?: string;
  imageUrl?: string;
};

// Get all help requests for admin review
export const getAllHelpRequests = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      HELP_REQUESTS_TABLE_ID,
      [] // No filter - get all requests
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching all help requests:', error);
    throw error;
  }
};

// Update help request status
export const updateHelpRequestStatus = async (requestId: string, status: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      HELP_REQUESTS_TABLE_ID,
      requestId,
      { status }
    );
    return response;
  } catch (error) {
    console.error('Error updating help request status:', error);
    throw error;
  }
};

// Download evidence file
export const downloadEvidenceFile = async (fileId: string, fileName: string) => {
  try {
    const fileData = await storage.getFileDownload(BUCKET_ID, fileId);
    
    // Convert ArrayBuffer to Base64
    const base64Data = Buffer.from(fileData).toString('base64');
    
    // Save to local device
     //@ts-ignore
    const fileUri = (FileSystem.documentDirectory || '') + fileName;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, { 
      encoding: 'base64' as any
    });
    
    return fileUri;
  } catch (error) {
    console.error('Error downloading evidence file:', error);
    throw error;
  }
};

// Create beneficiary post
export const createBeneficiaryPost = async (data: BeneficiaryPostData) => {
  try {
   
    
    const postDataWithDefaults = {
      ...data,
      collectedAmount: 0.0,
      status: 'active'
    };
    
    console.log('Final post data:', postDataWithDefaults);
    
    const response = await databases.createDocument(
      DATABASE_ID,
      POSTS_TABLE_ID,
      AppwriteID.unique(),
      postDataWithDefaults
    );
    
   
    return response;
  } catch (error : any) {
    console.error('Error creating beneficiary post:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    throw error;
  }
};

// Upload post image to the same bucket as evidence files
export const uploadPostImage = async (file: any) => {
  try {
    
    
    // Validate file object
    if (!file || !file.uri) {
      throw new Error('Invalid file object or missing URI');
    }

 

    // Use timestamp and prefix to distinguish from evidence files
    const timestamp = Date.now();
    const fileName = `post_image_${timestamp}.jpg`;
    
    // Create file object specifically for React Native Appwrite SDK
    const appwriteFile = {
      name: fileName,
      type: file.mimeType || file.type || 'image/jpeg',
      size: file.fileSize || file.size, // ImagePicker uses fileSize, not size
      uri: file.uri,
    };

   

    // Ensure we have valid file size
    if (!appwriteFile.size || appwriteFile.size === 0) {
      throw new Error('File size is 0 or undefined');
    }

    const response = await storage.createFile(
      BUCKET_ID,
      AppwriteID.unique(),
      appwriteFile
    );

    

    // Check if response is valid
    if (!response) {
      throw new Error('File upload returned null/undefined response');
    }

    if (!response.$id) {
      console.log('Response structure:', JSON.stringify(response, null, 2));
      throw new Error('File upload response missing $id field');
    }

    // Manual URL construction as fallback for React Native SDK
    const fileUrlString = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=68d43c4e0000ac29ecc0`;
    
  
    
    return { fileId: response.$id, fileUrl: fileUrlString };
  } catch (error: any) {
    console.error('Error uploading post image:', error);
    console.error('Error details:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      stack: error?.stack
    });
    throw error;
  }
};

// Update beneficiary post with image
export const updateBeneficiaryPostImage = async (postId: string, imageUrl: string) => {
  try {
    
    
    // Ensure imageUrl is a string
    const urlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl);
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      POSTS_TABLE_ID,
      postId,
      { imageUrl: urlString }
    );
    
   
    return response;
  } catch (error: any) {
    console.error('Error updating post image:', error);
    throw error;
  }
};



// Get all active beneficiary posts for donation feed
export const getAllBeneficiaryPosts = async (): Promise<BeneficiaryPostData[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      POSTS_TABLE_ID,
      [] // Get all posts, you can add filters if needed
    );
    return response.documents as unknown as BeneficiaryPostData[];
  } catch (error) {
    console.error('Error fetching beneficiary posts:', error);
    throw error;
  }
};

// Get single beneficiary post by ID
export const getBeneficiaryPostById = async (postId: string): Promise<BeneficiaryPostData> => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      POSTS_TABLE_ID,
      postId
    );
    return response as unknown as BeneficiaryPostData;
  } catch (error) {
    console.error('Error fetching beneficiary post:', error);
    throw error;
  }
};
