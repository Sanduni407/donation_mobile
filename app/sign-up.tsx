// app/sign-up.tsx
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

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'donor' | 'beneficiary' | 'volunteer'>('donor');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(fullName, email, password, role);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message || String(e));
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
              source={require('../assets/images/volunteer.jpg')}
              className="pt-12 pb-20 px-6 rounded-b-[50px] overflow-hidden"
              resizeMode="cover"
            >
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="mb-6 w-10 h-10 bg-white/30 rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <View className="items-center mt-4 mb-6">
                <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-xl mb-4">
                  <Ionicons name="person-add" size={48} color="#007DBD" />
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-3" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
                  Join Us Today
                </Text>
                <Text className="text-white text-center text-base px-8" style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>
                  Create an account and start making a positive impact
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Form Section */}
          <View className="flex-1 px-6 -mt-10">
            {/* Form Card */}
            <View className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
              {/* Full Name Input */}
              <View className="mb-5">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                  Full Name
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200">
                  <Ionicons name="person" size={22} color="#007DBD" />
                  <TextInput
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

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
              <View className="mb-5">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
                  Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-200">
                  <Ionicons name="lock-closed" size={22} color="#007DBD" />
                  <TextInput
                    placeholder="Create a password"
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
                <Text className="text-xs text-gray-500 mt-2 ml-1">
                  Must be at least 8 characters
                </Text>
              </View>

              {/* Role Selection */}
              <View className="mb-6">
                <Text className="text-sm font-bold text-gray-700 mb-3 ml-1">
                  Select Your Role
                </Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => setRole('donor')}
                    className={`flex-1 mr-2 py-4 rounded-2xl items-center border-2 ${
                      role === 'donor'
                        ? 'bg-[#007DBD] border-[#007DBD]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name="heart"
                      size={28}
                      color={role === 'donor' ? 'white' : '#007DBD'}
                    />
                    <Text
                      className={`mt-2 font-bold text-sm ${
                        role === 'donor' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Donor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRole('beneficiary')}
                    className={`flex-1 mx-1 py-4 rounded-2xl items-center border-2 ${
                      role === 'beneficiary'
                        ? 'bg-[#007DBD] border-[#007DBD]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name="hand-right"
                      size={28}
                      color={role === 'beneficiary' ? 'white' : '#007DBD'}
                    />
                    <Text
                      className={`mt-2 font-bold text-xs ${
                        role === 'beneficiary' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Beneficiary
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRole('volunteer')}
                    className={`flex-1 ml-2 py-4 rounded-2xl items-center border-2 ${
                      role === 'volunteer'
                        ? 'bg-[#007DBD] border-[#007DBD]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name="people"
                      size={28}
                      color={role === 'volunteer' ? 'white' : '#007DBD'}
                    />
                    <Text
                      className={`mt-2 font-bold text-sm ${
                        role === 'volunteer' ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      Volunteer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <View className="flex-row items-center mb-6 px-1">
                <Ionicons name="shield-checkmark" size={18} color="#007DBD" />
                <Text className="flex-1 text-xs text-gray-600 ml-2">
                  By signing up, you agree to our{' '}
                  <Text className="text-[#007DBD] font-bold">Terms</Text> and{' '}
                  <Text className="text-[#007DBD] font-bold">Privacy Policy</Text>
                </Text>
              </View>

              {/* Sign Up Button */}
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
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg mr-2">
                      Create Account
                    </Text>
                    <Ionicons name="arrow-forward-circle" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <View className="flex-row justify-center items-center pt-4">
                <Text className="text-gray-600 text-base">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/sign-in')}>
                  <Text className="text-[#007DBD] font-bold text-base">Sign In</Text>
                </TouchableOpacity>
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