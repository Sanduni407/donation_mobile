import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Sign in</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="border p-3 rounded mb-3" />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} className="border p-3 rounded mb-3" />
      <TouchableOpacity onPress={submit} className="bg-blue-500 p-4 rounded items-center">
        <Text className="text-white font-bold">Sign In</Text>
      </TouchableOpacity>

       <TouchableOpacity 
        onPress={() => router.push('/sign-up')} 
        className="mt-4 items-center"
      >
        <Text className="text-blue-500">Don't have an account? Sign up</Text>
      </TouchableOpacity>
     
    </View>
  );
}
