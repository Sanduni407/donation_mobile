import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-bold">Home</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
            <Text>{user?.name ? user.name[0] : 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mt-6">
        <Text>Welcome home!</Text>
      </View>
    </View>
  );
}
