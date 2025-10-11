// app/onboard/1.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Onboard1() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Progress Indicator */}
      <View className="px-6 pt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-[#007DBD]">Step 1 of 3</Text>
          <TouchableOpacity onPress={() => router.replace('/sign-up')}>
            <Text className="text-sm font-semibold text-gray-500">Skip</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row space-x-2">
          <View className="flex-1 h-1.5 bg-[#007DBD] rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 rounded-full" />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Decorative Circle Background */}
        <View className="absolute top-10 right-0 w-40 h-40 rounded-full bg-[#E0EEF7] opacity-30" />

        {/* Onboard illustration */}
        <Image
          source={require('../../assets/images/onboardone.jpg')}
          className="w-full h-96 mb-8"
          resizeMode="contain"
        />

        {/* Icon Badge */}
        <View className="w-16 h-16 bg-[#007DBD] rounded-full items-center justify-center mb-4 shadow-lg">
          <Ionicons name="hand-right" size={32} color="white" />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-[#007DBD] text-center mb-4">
          Connect & Request Help
        </Text>

        {/* Caption */}
        <Text className="text-base text-gray-600 text-center leading-6 px-4">
          Easily connect with the organization and request the help you need — your voice matters, and support is just a tap away.
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Next button */}
        <TouchableOpacity
          onPress={() => router.push('/onboard/2')}
          className="bg-[#007DBD] py-5 rounded-2xl shadow-xl flex-row items-center justify-center"
          style={{
            shadowColor: '#007DBD',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <Text className="text-white text-lg font-bold mr-2">Next</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="white" />
        </TouchableOpacity>

        {/* Dots Indicator */}
        <View className="flex-row justify-center items-center mt-6 space-x-2">
          <View className="w-3 h-3 bg-[#007DBD] rounded-full" />
          <View className="w-2 h-2 bg-gray-300 rounded-full" />
          <View className="w-2 h-2 bg-gray-300 rounded-full" />
        </View>
      </View>
    </SafeAreaView>
  );
}