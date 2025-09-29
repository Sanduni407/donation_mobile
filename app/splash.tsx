import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function Splash() {
  const { user, loading, hasOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth finishes loading
    // small delay for splash feel
    setTimeout(() => {
      if (user) router.replace('/(tabs)/home'); // logged in -> home
      else if (!hasOnboarded) router.replace('/onboard/1'); // new -> onboarding
      else router.replace('/sign-in'); // returning logged out -> sign in
    }, 900);
  }, [loading, user, hasOnboarded]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold">Your App Name</Text>
      <Text className="mt-4">Loading…</Text>
    </View>
  );
}
