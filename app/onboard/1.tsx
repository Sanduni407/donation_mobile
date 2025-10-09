import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Onboard1() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      {/* Onboard illustration */}
      <Image
        source={require('../../assets/images/onboardone.jpg')}
        className="w-72 h-72 mb-8"
        resizeMode="contain"
      />

      {/* Title */}
      <Text className="text-2xl font-bold text-[#007DBD] text-center mb-3">
        Connect & Request Help
      </Text>

      {/* Caption */}
      <Text className="text-base text-gray-600 text-center leading-6">
        Easily connect with the organization and request the help you need —{"\n"}
        your voice matters, and support is just a tap away.
      </Text>

      {/* Next button */}
      <TouchableOpacity
        onPress={() => router.push('/onboard/2')}
        className="mt-10 bg-[#007DBD] px-8 py-3 rounded-full shadow-md"
      >
        <Text className="text-white text-lg font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
}
