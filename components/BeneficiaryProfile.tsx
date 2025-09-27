import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

export default function BeneficiaryProfile({ user }: any) {
  const { signOut , deleteAccount } = useAuth();


   const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  return (
    <View>
      <Text className="text-2xl font-bold">Beneficiary Profile</Text>
      <Text className="mt-2">MyName: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>


       <TouchableOpacity onPress={handleDelete} className="mt-6 bg-red-500 p-3 rounded">
        <Text className="text-white text-center">Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => signOut()} className="mt-6 bg-red-500 p-3 rounded">
        <Text className="text-white">Logout</Text>
      </TouchableOpacity>


     
    </View>
  );
}
