// app/onboard/2.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Onboard2() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Image
        source={require('../../assets/images/onboardtwo.jpg')}
        className="w-80 h-80 mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-center mb-4">Give, Volunteer & Empower</Text>
      <Text className="text-center text-gray-700">
        Make a real difference — donate, volunteer, and spread kindness to empower lives and bring hope to those in need.
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/onboard/3')}
        className="mt-8 px-6 py-3 rounded bg-blue-500"
      >
        <Text className="text-white font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
}
