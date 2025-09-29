import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createBeneficiaryPost, downloadEvidenceFile, updateHelpRequestStatus } from '../../../lib/admin';
import { databases } from '../../../lib/appwrite';

export default function RequestDetail() {
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = await databases.getDocument(
        '68d797e8002551ac5a86', // DATABASE_ID
        'helprequests', // TABLE_ID
        id as string
      );
      setRequest(response);
    } catch (error) {
      console.error('Error fetching request detail:', error);
      Alert.alert('Error', 'Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetail();
    }
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await updateHelpRequestStatus(id as string, status);
      setRequest({ ...request, status });
      Alert.alert('Success', `Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadEvidence = async () => {
    if (!request.evidenceFileIds) {
      Alert.alert('No File', 'No evidence file available for download');
      return;
    }

    try {
      setDownloading(true);
      const fileName = `evidence_${request.beneficiaryRequestCode}.pdf`;
      const localUri = await downloadEvidenceFile(request.evidenceFileIds, fileName);
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      } else {
        Alert.alert('Success', `File downloaded to: ${localUri}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download evidence file');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setUpdating(true);
      
      
      const postData = {
        helpRequestId: request.$id,
        beneficiaryRequestCode: request.beneficiaryRequestCode,
        beneficiaryName: request.fullName,
        description: request.description,
        itemsNeeded: request.itemsNeeded,
        goalAmount: request.requestedAmount,
        urgencyLevel: request.urgency,
      };

      const createdPost = await createBeneficiaryPost(postData);
      
      Alert.alert(
        'Success', 
        'Post created successfully! Now add an image.',
        [
          {
            text: 'Add Image',
            onPress: () => router.push(`/admin/add-image/${createdPost.$id}` as any)
          }
        ]
      );
    } catch (error : any) {
      console.error('Error creating post:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to create post: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading request details...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Request not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Request Details</Text>
      
      {/* Request Info */}
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold mb-2">{request.fullName}</Text>
        <Text className="mb-1">Code: {request.beneficiaryRequestCode}</Text>
        <Text className="mb-1">Age: {request.age}</Text>
        <Text className="mb-1">Location: {request.location}</Text>
        <Text className="mb-1">Type: {request.typeOfHelp}</Text>
        <Text className="mb-1">Amount: ${request.requestedAmount}</Text>
        <Text className="mb-1">Urgency: {request.urgency}</Text>
        <Text className="mb-1">Status: {request.status}</Text>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2">Description</Text>
        <Text className="text-gray-700">{request.description}</Text>
      </View>

      {/* Items Needed */}
      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2">Items Needed</Text>
        <Text className="text-gray-700">
          {Array.isArray(request.itemsNeeded) ? request.itemsNeeded.join(', ') : request.itemsNeeded}
        </Text>
      </View>

      {/* Payment Details */}
      {request.paymentDetails && (
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Payment Details</Text>
          <Text className="text-gray-700">{request.paymentDetails}</Text>
        </View>
      )}

      {/* Evidence File */}
      {request.evidenceFileIds && (
        <TouchableOpacity
          onPress={handleDownloadEvidence}
          disabled={downloading}
          className="bg-blue-500 p-3 rounded mb-4"
        >
          <Text className="text-white text-center font-semibold">
            {downloading ? 'Downloading...' : 'Download Evidence File'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Status Update Buttons */}
      {request.status === 'Pending' && (
        <View className="flex-row space-x-2 mb-4">
          <TouchableOpacity
            onPress={() => handleStatusUpdate('Approved')}
            disabled={updating}
            className="flex-1 bg-green-500 p-3 rounded mr-2"
          >
            <Text className="text-white text-center font-semibold">Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleStatusUpdate('Rejected')}
            disabled={updating}
            className="flex-1 bg-red-500 p-3 rounded ml-2"
          >
            <Text className="text-white text-center font-semibold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Post Button */}
      {request.status === 'Approved' && (
        <TouchableOpacity
          onPress={handleCreatePost}
          disabled={updating}
          className="bg-purple-500 p-3 rounded mb-4"
        >
          <Text className="text-white text-center font-semibold">
            {updating ? 'Creating Post...' : 'Create Public Post'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}



