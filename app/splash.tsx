// app/splash.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StatusBar, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function Splash() {
  const { user, loading, hasOnboarded } = useAuth();
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return; // wait until auth finishes loading
    setTimeout(() => {
      if (user) router.replace('/(tabs)/home'); // logged in -> home
      else if (!hasOnboarded) router.replace('/onboard/1'); // new -> onboarding
      else router.replace('/sign-in'); // returning logged out -> sign in
    }, 3000);
  }, [loading, user, hasOnboarded]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Decorative Background Circles */}
      <View className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#E0EEF7] opacity-40" />
      <View className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-[#E0EEF7] opacity-40" />
      <View className="absolute top-40 -left-20 w-40 h-40 rounded-full bg-[#FFB900] opacity-20" />
      <View className="absolute bottom-40 right-0 w-32 h-32 rounded-full bg-[#007DBD] opacity-10" />

      {/* Main Content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* Logo with Glow Effect */}
        <View className="items-center justify-center mb-8">
          <View className="absolute w-32 h-32 rounded-full bg-[#007DBD] opacity-10" />
          <View className="absolute w-28 h-28 rounded-full bg-[#007DBD] opacity-20" />
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        </View>

        {/* App Name with Icon */}
        <View className="flex-row items-center mb-3">
          <Text className="text-5xl font-bold text-[#007DBD]">
            Echokind
          </Text>
          <View className="ml-2">
            <Ionicons name="heart" size={32} color="#FFB900" />
          </View>
        </View>

        {/* Slogan */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-lg text-gray-600 text-center px-8 mb-2 italic">
            Be the reason hope echoes today
          </Text>
          
          {/* Decorative Line */}
          <View className="flex-row items-center justify-center mt-4">
            <View className="w-8 h-0.5 bg-[#FFB900]" />
            <Ionicons name="ellipse" size={6} color="#FFB900" style={{ marginHorizontal: 8 }} />
            <View className="w-8 h-0.5 bg-[#FFB900]" />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: 'absolute',
          bottom: 80,
        }}
        className="items-center"
      >
        <View className="flex-row space-x-2">
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#007DBD',
              opacity: fadeAnim,
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#007DBD',
              opacity: fadeAnim,
            }}
          />
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#007DBD',
              opacity: fadeAnim,
            }}
          />
        </View>
        <Text className="text-xs text-gray-400 mt-4">Loading your experience...</Text>
      </Animated.View>

      {/* Version Info */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: 'absolute',
          bottom: 30,
        }}
      >
        <Text className="text-xs text-gray-400">Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
}