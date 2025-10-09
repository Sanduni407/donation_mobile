// app/sign-in.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (e:any) {
      Alert.alert('Sign in failed', e?.message || String(e));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <Text className="text-3xl font-bold text-center mb-6">Sign In</Text>

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
        className="border border-gray-300 p-4 rounded-xl mb-6 bg-gray-50"
      />

      <TouchableOpacity
        onPress={submit}
        className="bg-blue-500 p-4 rounded-xl items-center shadow-md"
      >
        <Text className="text-white font-bold text-lg">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/sign-up')}
        className="mt-4 items-center"
      >
        <Text className="text-blue-500">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
