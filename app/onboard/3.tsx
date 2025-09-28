import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Onboard3() {
  const router = useRouter();
 
  const finish = async () => {
    
    router.replace('/sign-up');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold">Ready to get started?</Text>
      <TouchableOpacity onPress={finish} className="mt-8 px-6 py-3 rounded bg-green-600">
        <Text className="text-white">Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
