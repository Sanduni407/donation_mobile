// components/adminProfile/AdminProfile.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="text-xl font-semibold mb-2">Admin Profile</Text>
        <Text className="text-lg">Name: {user?.name}</Text>
        <Text className="text-lg">Email: {user?.email}</Text>
        <Text className="text-lg">Role: {user?.prefs?.role || 'Admin'}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4">Admin Actions</Text>

        {/* Create Workshop */}
        <TouchableOpacity
          className="mb-3 rounded-lg overflow-hidden"
          onPress={() => router.push('/workshop/create')}
        >
          <LinearGradient
            colors={['#0b1220', '#0f3b80']} // blue-950 -> blue-800 like
            style={{ padding: 14, borderRadius: 8 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-semibold">Create Workshop</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* View My Workshops */}
        <TouchableOpacity
          className="mb-3 rounded-lg overflow-hidden"
          onPress={() => router.push('/workshop/my-workshops')}
        >
          <LinearGradient
            colors={['#ff4d6d', '#e64964']} // rose gradient
            style={{ padding: 14, borderRadius: 8 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="list-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white text-center font-semibold">My Workshops</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Existing action: View All Help Requests (kept) */}
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-3"
          onPress={() => router.push('/admin/help-requests')}
        >
          <Text className="text-white text-center font-semibold">View All Help Requests</Text>
        </TouchableOpacity>

      </View>

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
