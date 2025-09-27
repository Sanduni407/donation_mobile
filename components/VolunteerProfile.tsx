import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function VolunteerProfile({ user }: any) {
  const { signOut } = useAuth();
  return (
    <View>
      <Text className="text-2xl font-bold">Volunteer Profile</Text>
      <Text className="mt-2">Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>

      <TouchableOpacity onPress={() => signOut()} className="mt-6 bg-red-500 p-3 rounded">
        <Text className="text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
