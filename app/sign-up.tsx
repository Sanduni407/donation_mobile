// app/sign-up.tsx
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor'|'beneficiary'|'volunteer'>('donor');

  const submit = async () => {
    if (!fullName || !email || !password) return Alert.alert('Please fill all fields');
    try {
      await signUp(fullName, email, password, role);
      router.replace('/(tabs)/home');
    } catch (e:any) {
      Alert.alert('Sign up failed', e?.message || String(e));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <Text className="text-3xl font-bold text-center mb-6">Create an Account</Text>

      <TextInput
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="none"   // ensures keyboard is lowercase first
        className="border border-gray-300 p-4 rounded-xl mb-4 bg-gray-50"
      />
      <TextInput
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        className="border border-gray-300 p-4 rounded-xl mb-4 bg-gray-50"
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        className="border border-gray-300 p-4 rounded-xl mb-4 bg-gray-50"
      />

      <Text className="mb-2 font-medium">Role</Text>
      <View className="border border-gray-300 rounded-xl mb-6 bg-gray-50">
        <Picker selectedValue={role} onValueChange={(v) => setRole(v)}>
          <Picker.Item label="Donor" value="donor" />
          <Picker.Item label="Beneficiary" value="beneficiary" />
          <Picker.Item label="Volunteer" value="volunteer" />
        </Picker>
      </View>

      <TouchableOpacity onPress={submit} className="bg-blue-500 p-4 rounded-xl items-center shadow-md">
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/sign-in')} className="mt-4 items-center">
        <Text className="text-gray-600">Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
