import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Onboard1() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold">Welcome — what we do</Text>
      <Text className="mt-4 text-center">Short intro line here.</Text>

      <TouchableOpacity onPress={() => router.push('/onboard/2')} className="mt-8 px-6 py-3 rounded bg-blue-500">
        <Text className="text-white">Next</Text>
      </TouchableOpacity>
    </View>
  );
}
