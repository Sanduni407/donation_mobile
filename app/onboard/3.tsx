// app/onboard/3.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Onboard3() {
  const router = useRouter();

  const finish = () => {
    router.replace('/sign-up');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Image
        source={require('../../assets/images/onboardthree.jpg')}
        className="w-80 h-80 mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-center mb-4">Learn & Grow Together</Text>
      <Text className="text-center text-gray-700">
        Join empowering workshops, learn new skills, and build self-employment opportunities that create lasting change.
      </Text>

      <TouchableOpacity
        onPress={finish}
        className="mt-8 px-6 py-3 rounded bg-green-600"
      >
        <Text className="text-white font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
