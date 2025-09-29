import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getAllHelpRequests } from '../../lib/admin';

export default function HelpRequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllHelpRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch help requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const renderRequestItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-lg border border-gray-200"
      onPress={() => router.push(`/admin/request-detail/${item.$id}` as any)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800">{item.fullName}</Text>
        <View className={`px-2 py-1 rounded ${
          item.status === 'Pending' ? 'bg-yellow-200' :
          item.status === 'Approved' ? 'bg-green-200' :
          'bg-red-200'
        }`}>
          <Text className={`text-xs font-semibold ${
            item.status === 'Pending' ? 'text-yellow-800' :
            item.status === 'Approved' ? 'text-green-800' :
            'text-red-800'
          }`}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-600 mb-1">Code: {item.beneficiaryRequestCode}</Text>
      <Text className="text-gray-600 mb-1">Type: {item.typeOfHelp}</Text>
      <Text className="text-gray-600 mb-1">Amount: ${item.requestedAmount}</Text>
      <Text className="text-gray-600 mb-2">Urgency: {item.urgency}</Text>
      
      <Text className="text-gray-700" numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Loading help requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Help Requests</Text>
      
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.$id}
        refreshing={loading}
        onRefresh={fetchRequests}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg">No help requests found</Text>
          </View>
        }
      />
    </View>
  );
}










