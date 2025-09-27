// app/sign-up.tsx
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Create an account</Text>
      <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} className="border p-3 rounded mb-3" />
      <TextInput placeholder="Email" value={email} keyboardType="email-address" onChangeText={setEmail} className="border p-3 rounded mb-3" />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} className="border p-3 rounded mb-3" />
      <Text className="mb-2">Role</Text>
      <View className="border rounded mb-4">
        <Picker selectedValue={role} onValueChange={(v) => setRole(v)}>
          <Picker.Item label="Donor" value="donor" />
          <Picker.Item label="Beneficiary" value="beneficiary" />
          <Picker.Item label="Volunteer" value="volunteer" />
        </Picker>
      </View>

      <TouchableOpacity onPress={submit} className="bg-blue-500 p-4 rounded items-center">
        <Text className="text-white font-bold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/sign-in')} className="mt-4 items-center">
        <Text>Already have account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}
