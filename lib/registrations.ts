import { AppwriteID, databases } from './appwrite';

const DATABASE_ID = '68d797e8002551ac5a86';
const REGISTRATIONS_TABLE_ID = 'workshop_registrations';

export interface Registration {
  $id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  status: 'Registered' | 'Attended' | 'Cancelled';
  workshopId: string;
  workshopTitle: string;
  registrationDate: string;
}

export type RegistrationData = {
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  workshopId: string;
  workshopTitle: string;
  status?: 'Registered' | 'Attended' | 'Cancelled';
};

// Create registration
export const createRegistration = async (data: RegistrationData): Promise<Registration> => {
  try {
    const exists = await checkExistingRegistration(data.beneficiaryId, data.workshopId);
    if (exists) {
      throw new Error('You have already registered for this workshop');
    }

    const now = new Date().toISOString();

    const registrationData = {
      ...data,
      status: data.status || 'Registered' as const,
      registrationDate: now,
    };

    const response = await databases.createDocument(
      DATABASE_ID,
      REGISTRATIONS_TABLE_ID,
      AppwriteID.unique(),
      registrationData
    );

    return {
      $id: response.$id,
      beneficiaryId: response.beneficiaryId,
      beneficiaryName: response.beneficiaryName,
      beneficiaryEmail: response.beneficiaryEmail,
      status: response.status,
      workshopId: response.workshopId,
      workshopTitle: response.workshopTitle,
      registrationDate: response.registrationDate,
    } as Registration;
  } catch (error: any) {
    console.error('Error creating registration:', error);
    throw error;
  }
};

// Check if user already registered
export const checkExistingRegistration = async (beneficiaryId: string, workshopId: string): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, REGISTRATIONS_TABLE_ID);
    return response.documents.some(
      doc => doc.beneficiaryId === beneficiaryId &&
             doc.workshopId === workshopId &&
             doc.status !== 'Cancelled'
    );
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
};

// Get registrations for a workshop
export const getWorkshopRegistrations = async (workshopId: string): Promise<Registration[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, REGISTRATIONS_TABLE_ID);
    return response.documents
      .filter(doc => doc.workshopId === workshopId && doc.status !== 'Cancelled')
      .map(doc => ({
        $id: doc.$id,
        beneficiaryId: doc.beneficiaryId,
        beneficiaryName: doc.beneficiaryName,
        beneficiaryEmail: doc.beneficiaryEmail,
        status: doc.status,
        workshopId: doc.workshopId,
        workshopTitle: doc.workshopTitle,
        registrationDate: doc.registrationDate,
      } as Registration));
  } catch (error) {
    console.error('Error fetching workshop registrations:', error);
    throw error;
  }
};

// Get user's registrations
export const getUserRegistrations = async (beneficiaryId: string): Promise<Registration[]> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, REGISTRATIONS_TABLE_ID);
    return response.documents
      .filter(doc => doc.beneficiaryId === beneficiaryId)
      .map(doc => ({
        $id: doc.$id,
        beneficiaryId: doc.beneficiaryId,
        beneficiaryName: doc.beneficiaryName,
        beneficiaryEmail: doc.beneficiaryEmail,
        status: doc.status,
        workshopId: doc.workshopId,
        workshopTitle: doc.workshopTitle,
        registrationDate: doc.registrationDate,
      } as Registration));
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    throw error;
  }
};

// Cancel registration
export const cancelRegistration = async (registrationId: string): Promise<void> => {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      REGISTRATIONS_TABLE_ID,
      registrationId,
      { status: 'Cancelled' } // only update status, other fields removed
    );
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw error;
  }
};
