// app/sign-in.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#007DBD" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section with Background Image */}
          <View className="relative">
            <ImageBackground
              source={require('../assets/images/community.jpg')}
              className="pt-12 pb-20 px-6 rounded-b-[50px] overflow-hidden"
              resizeMode="cover"
            >
              <View className="items-center mt-8 mb-6">
                <View className="w-28 h-28 bg-white rounded-full items-center justify-center shadow-xl mb-4">
                  <Ionicons name="heart" size={56} color="#007DBD" />
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-3" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
                  Welcome Back!
                </Text>
                <Text className="text-white text-center text-base px-8" style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>
                  Sign in to continue making a difference in people's lives
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Form Section */}
          <View className="flex-1 px-6 -mt-10">
            {/* Form Card */}
            <View className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                  Email Address
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200">
                  <Ionicons name="mail" size={22} color="#007DBD" />
                  <TextInput
                    placeholder="Enter your email"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                  Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200">
                  <Ionicons name="lock-closed" size={22} color="#007DBD" />
                  <TextInput
                    placeholder="Enter your password"
                    value={password}
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={22}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="items-end mb-6">
                <Text className="text-[#007DBD] font-bold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={submit}
                disabled={loading}
                className="bg-[#007DBD] py-5 rounded-2xl items-center shadow-xl mb-4"
                style={{
                  shadowColor: '#007DBD',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 10,
                }}
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg mr-2">
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg mr-2">
                      Sign In
                    </Text>
                    <Ionicons name="arrow-forward-circle" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center pt-4">
                <Text className="text-gray-600 text-base">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/sign-up')}>
                  <Text className="text-[#007DBD] font-bold text-base">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trust Indicators */}
            <View className="flex-row justify-around px-4 mb-8">
              <View className="items-center">
                <View className="w-14 h-14 bg-[#E0EEF7] rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="shield-checkmark" size={28} color="#007DBD" />
                </View>
                <Text className="text-xs text-gray-600 font-semibold">Secure</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-[#E0EEF7] rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="lock-closed" size={28} color="#007DBD" />
                </View>
                <Text className="text-xs text-gray-600 font-semibold">Private</Text>
              </View>
              <View className="items-center">
                <View className="w-14 h-14 bg-[#E0EEF7] rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="heart" size={28} color="#FFB900" />
                </View>
                <Text className="text-xs text-gray-600 font-semibold">Trusted</Text>
              </View>
            </View>

            {/* Bottom Padding */}
            <View className="h-8" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}