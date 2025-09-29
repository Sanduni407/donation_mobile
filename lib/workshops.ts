import { AppwriteID, databases, storage } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const WORKSHOPS_TABLE_ID = 'workshops';
const BUCKET_ID = '68d79ed4003b71ab46cd';

export interface Workshop {
  $id: string;
  title: string;
  organizer: string;
  purpose: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  imageUrl?: string;
  targetBeneficiaries: string;
  duration: string;
  capacity: number;
  requirements?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  adminId: string;
  adminName: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkshopData = {
  title: string;
  organizer: string;
  purpose: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  imageUrl?: string;
  targetBeneficiaries: string;
  duration: string;
  capacity: number;
  requirements?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  adminId: string;
  adminName: string;
  createdAt?: string;
  updatedAt?: string;
};

// Check if user is admin
export const isAdmin = (userPrefs: any): boolean => {
  return userPrefs?.role === 'admin';
};

// Create workshop (admins only)
export const createWorkshop = async (data: WorkshopData, userRole: string): Promise<Workshop> => {
  if (userRole !== 'admin') {
    throw new Error('Only admins can create workshops');
  }

  try {
    const workshopDataWithDefaults = {
      ...data,
      status: data.status || 'Upcoming' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const response = await databases.createDocument(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID,
      AppwriteID.unique(),
      workshopDataWithDefaults
    );
    
    return {
      $id: response.$id,
      title: response.title,
      organizer: response.organizer,
      purpose: response.purpose,
      category: response.category,
      date: response.date,
      time: response.time,
      venue: response.venue,
      imageUrl: response.imageUrl,
      targetBeneficiaries: response.targetBeneficiaries,
      duration: response.duration,
      capacity: response.capacity,
      requirements: response.requirements,
      status: response.status,
      adminId: response.adminId,
      adminName: response.adminName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    } as Workshop;
  } catch (error: any) {
    console.error('Error creating workshop:', error);
    throw error;
  }
};

// Get all workshops (accessible to all logged-in users)
export const getAllWorkshops = async (): Promise<Workshop[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID
    );
    
    const workshops = response.documents.map(workshop => ({
      $id: workshop.$id,
      title: workshop.title,
      organizer: workshop.organizer,
      purpose: workshop.purpose,
      category: workshop.category,
      date: workshop.date,
      time: workshop.time,
      venue: workshop.venue,
      imageUrl: workshop.imageUrl,
      targetBeneficiaries: workshop.targetBeneficiaries,
      duration: workshop.duration,
      capacity: workshop.capacity,
      requirements: workshop.requirements,
      status: workshop.status,
      adminId: workshop.adminId,
      adminName: workshop.adminName,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt
    } as Workshop));
    
    return workshops.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching workshops:', error);
    throw error;
  }
};

// Get workshops by specific admin
export const getWorkshopsByAdmin = async (adminId: string): Promise<Workshop[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID
    );
    
    const adminWorkshops = response.documents
      .filter(workshop => workshop.adminId === adminId)
      .map(workshop => ({
        $id: workshop.$id,
        title: workshop.title,
        organizer: workshop.organizer,
        purpose: workshop.purpose,
        category: workshop.category,
        date: workshop.date,
        time: workshop.time,
        venue: workshop.venue,
        imageUrl: workshop.imageUrl,
        targetBeneficiaries: workshop.targetBeneficiaries,
        duration: workshop.duration,
        capacity: workshop.capacity,
        requirements: workshop.requirements,
        status: workshop.status,
        adminId: workshop.adminId,
        adminName: workshop.adminName,
        createdAt: workshop.createdAt,
        updatedAt: workshop.updatedAt
      } as Workshop));
    
    return adminWorkshops.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching admin workshops:', error);
    throw error;
  }
};

// Update workshop (admins only, own workshops only)
export const updateWorkshop = async (
  workshopId: string, 
  updateData: Partial<WorkshopData>, 
  userRole: string, 
  userId: string
): Promise<Workshop> => {
  if (userRole !== 'admin') {
    throw new Error('Only admins can update workshops');
  }

  try {
    const existingWorkshop = await getWorkshopById(workshopId);
    if (existingWorkshop.adminId !== userId) {
      throw new Error('You can only update your own workshops');
    }

    const dataWithUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    const response = await databases.updateDocument(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID,
      workshopId,
      dataWithUpdate
    );
    
    return {
      $id: response.$id,
      title: response.title,
      organizer: response.organizer,
      purpose: response.purpose,
      category: response.category,
      date: response.date,
      time: response.time,
      venue: response.venue,
      imageUrl: response.imageUrl,
      targetBeneficiaries: response.targetBeneficiaries,
      duration: response.duration,
      capacity: response.capacity,
      requirements: response.requirements,
      status: response.status,
      adminId: response.adminId,
      adminName: response.adminName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    } as Workshop;
  } catch (error) {
    console.error('Error updating workshop:', error);
    throw error;
  }
};

// Delete workshop (admins only, own workshops only)
export const deleteWorkshop = async (workshopId: string, userRole: string, userId: string): Promise<void> => {
  if (userRole !== 'admin') {
    throw new Error('Only admins can delete workshops');
  }

  try {
    const existingWorkshop = await getWorkshopById(workshopId);
    if (existingWorkshop.adminId !== userId) {
      throw new Error('You can only delete your own workshops');
    }

    await databases.deleteDocument(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID,
      workshopId
    );
  } catch (error) {
    console.error('Error deleting workshop:', error);
    throw error;
  }
};

// Get single workshop by ID
export const getWorkshopById = async (workshopId: string): Promise<Workshop> => {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      WORKSHOPS_TABLE_ID,
      workshopId
    );
    
    return {
      $id: response.$id,
      title: response.title,
      organizer: response.organizer,
      purpose: response.purpose,
      category: response.category,
      date: response.date,
      time: response.time,
      venue: response.venue,
      imageUrl: response.imageUrl,
      targetBeneficiaries: response.targetBeneficiaries,
      duration: response.duration,
      capacity: response.capacity,
      requirements: response.requirements,
      status: response.status,
      adminId: response.adminId,
      adminName: response.adminName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    } as Workshop;
  } catch (error) {
    console.error('Error fetching workshop by ID:', error);
    throw error;
  }
};

// Upload image for workshop
export const uploadWorkshopImage = async (file: any): Promise<{ fileId: string; fileUrl: string }> => {
  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object or missing URI');
    }

    const timestamp = Date.now();
    const fileName = `workshop_${timestamp}.jpg`;
    
    const appwriteFile = {
      name: fileName,
      type: file.mimeType || file.type || 'image/jpeg',
      size: file.fileSize || file.size,
      uri: file.uri,
    };

    if (!appwriteFile.size || appwriteFile.size === 0) {
      throw new Error('File size is 0 or undefined');
    }

    const response = await storage.createFile(
      BUCKET_ID,
      AppwriteID.unique(),
      appwriteFile
    );

    if (!response || !response.$id) {
      throw new Error('File upload failed');
    }

    const fileUrlString = `https://fra.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=68d43c4e0000ac29ecc0`;
    
    return { fileId: response.$id, fileUrl: fileUrlString };
  } catch (error: any) {
    console.error('Error uploading workshop image:', error);
    throw error;
  }
};

// Get workshops by category
export const getWorkshopsByCategory = async (category: string): Promise<Workshop[]> => {
  try {
    const allWorkshops = await getAllWorkshops();
    return allWorkshops.filter(workshop => 
      workshop.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error('Error fetching workshops by category:', error);
    throw error;
  }
};

// Get workshops by status
export const getWorkshopsByStatus = async (status: Workshop['status']): Promise<Workshop[]> => {
  try {
    const allWorkshops = await getAllWorkshops();
    return allWorkshops.filter(workshop => workshop.status === status);
  } catch (error) {
    console.error('Error fetching workshops by status:', error);
    throw error;
  }
};

// Helper function to format date
export const formatWorkshopDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};