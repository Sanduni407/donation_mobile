import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { deleteHelpRequest, downloadEvidenceFile } from '../lib/beneficiary';

interface Props {
  request: any; // replace with your HelpRequest type
  onDeleted?: () => void;
  onEdited?: () => void;
}

const HelpRequestCard: React.FC<Props> = ({ request, onDeleted, onEdited }) => {
  
  const handleDownload = async () => {
  if (!request.evidenceFileIds) return Alert.alert('No file', 'No evidence uploaded.');
  try {
    // Pass a file name (e.g., based on request code)
    const fileUri = await downloadEvidenceFile(request.evidenceFileIds, `${request.beneficiaryRequestCode}.pdf`);
    Alert.alert('Downloaded', `File saved to: ${fileUri}`);
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to download file.');
  }
};


  const handleDelete = async () => {
    try {
      await deleteHelpRequest(request.$id);
      Alert.alert('Deleted', 'Request has been deleted.');
      onDeleted && onDeleted();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete request.');
    }
  };

  const handleEdit = () => {
    onEdited && onEdited();
    // navigate to edit screen or open modal
  };

  return (
    <View className="border p-4 rounded mb-4 bg-white shadow">
      <Text className="text-lg font-bold">{request.typeOfHelp}</Text>
      <Text className="text-gray-600">{request.description}</Text>
      <Text className="mt-1 text-sm">Status: {request.status}</Text>
      <View className="flex-row mt-2 space-x-4">
        <TouchableOpacity onPress={handleEdit} className="bg-yellow-500 p-2 rounded">
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="bg-red-500 p-2 rounded">
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
        {request.evidenceFileIds && (
          <TouchableOpacity onPress={handleDownload} className="bg-blue-500 p-2 rounded">
            <Text className="text-white">Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HelpRequestCard;