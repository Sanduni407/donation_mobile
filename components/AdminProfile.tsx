import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function AdminProfile() {
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-6">Admin Dashboard</Text>
      
      {/* Admin Info Section */}
      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="text-xl font-semibold mb-2">Admin Profile</Text>
        <Text className="text-lg">Name: {user?.name}</Text>
        <Text className="text-lg">Email: {user?.email}</Text>
        <Text className="text-lg">Role: {user?.prefs?.role || 'Admin'}</Text>
      </View>

      {/* Admin Actions */}
      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4">Admin Actions</Text>
        
        <TouchableOpacity 
          className="bg-blue-500 p-4 rounded-lg mb-3"
        >
          <Text className="text-white text-center font-semibold">View All Help Requests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-green-500 p-4 rounded-lg mb-3">
          <Text className="text-white text-center font-semibold">View Donations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-purple-500 p-4 rounded-lg mb-3">
          <Text className="text-white text-center font-semibold">Manage Posts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-orange-500 p-4 rounded-lg mb-3">
          <Text className="text-white text-center font-semibold">System Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View className="mt-6">
        <TouchableOpacity onPress={() => signOut()} className="bg-red-500 p-4 rounded-lg mb-3">
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleDelete} className="bg-red-700 p-4 rounded-lg">
          <Text className="text-white text-center font-semibold">Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}