// app/splash.tsx
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function Splash() {
  const { user, loading, hasOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth finishes loading
    setTimeout(() => {
      if (user) router.replace('/(tabs)/home'); // logged in -> home
      else if (!hasOnboarded) router.replace('/onboard/1'); // new -> onboarding
      else router.replace('/sign-in'); // returning logged out -> sign in
    }, 3000);
  }, [loading, user, hasOnboarded]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#E0EEF7' }}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        resizeMode="contain"
      />

      {/* App Name */}
      <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#007DBD', marginBottom: 10 }}>
        Echokind
      </Text>

      {/* Slogan */}
      <Text style={{ fontSize: 16, color: '#FFB900', textAlign: 'center', paddingHorizontal: 30 }}>
        Be the reason hope echoes today
      </Text>
    </View>
  );
}
