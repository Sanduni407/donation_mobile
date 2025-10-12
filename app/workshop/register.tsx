import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { createRegistration } from '../../lib/registrations';

export default function RegisterScreen() {
  const { workshopId, workshopTitle } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [beneficiaryName, setBeneficiaryName] = useState(user?.name || '');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!beneficiaryName.trim() || !beneficiaryEmail.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(beneficiaryEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const registration = await createRegistration({
        beneficiaryName: beneficiaryName.trim(),
        beneficiaryEmail: beneficiaryEmail.trim(),
        beneficiaryId: user?.$id || '',
        workshopId: workshopId as string,
        workshopTitle: workshopTitle as string,
      });

      Alert.alert(
        'Registration Successful!',
        `You have successfully registered for this workshop.\n\nRegistration Date: ${new Date(
          registration.registrationDate
        ).toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error?.message || 'Failed to register for workshop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-[#007DBD] px-5 pt-6 pb-8 rounded-b-3xl shadow-lg mb-6">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">Workshop Registration</Text>
              </View>
            </View>

            {/* Workshop Title Card */}
            <View className="bg-white rounded-2xl p-4 shadow-lg">
              <View className="flex-row items-center">
                <View className="bg-[#FFF3CD] w-12 h-12 rounded-full items-center justify-center mr-3">
                  <Ionicons name="school" size={24} color="#FFB900" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Registering for</Text>
                  <Text className="text-base font-bold text-gray-900" numberOfLines={2}>
                    {workshopTitle}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 pb-6">
            {/* Info Banner */}
            <View className="bg-[#E0EEF7] rounded-xl p-4 mb-6 flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#007DBD" />
              <Text className="text-sm text-gray-700 ml-3 flex-1 leading-5">
                Please provide your contact information. You'll receive confirmation details via email.
              </Text>
            </View>

            {/* Full Name Field */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Full Name <Text className="text-red-600">*</Text>
              </Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  value={beneficiaryName}
                  onChangeText={setBeneficiaryName}
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Email Address <Text className="text-red-600">*</Text>
              </Text>
              <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  value={beneficiaryEmail}
                  onChangeText={setBeneficiaryEmail}
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Benefits Info */}
            <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-3">
                What to expect:
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <View className="bg-[#E0EEF7] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={18} color="#007DBD" />
                  </View>
                  <Text className="text-sm text-gray-700 flex-1">
                    Instant email confirmation
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <View className="bg-[#E0EEF7] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={18} color="#007DBD" />
                  </View>
                  <Text className="text-sm text-gray-700 flex-1">
                    Workshop reminders
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-[#E0EEF7] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={18} color="#007DBD" />
                  </View>
                  <Text className="text-sm text-gray-700 flex-1">
                    Access to workshop materials
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`py-4 rounded-xl shadow-lg ${submitting ? 'bg-gray-400' : 'bg-[#FFB900]'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                {submitting ? (
                  <>
                    <Text className="text-[#007DBD] text-lg font-bold mr-2">Registering</Text>
                    <Text className="text-[#007DBD] text-lg font-bold">...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-[#007DBD] text-lg font-bold mr-2">
                      Complete Registration
                    </Text>
                    <Ionicons name="checkmark-circle" size={24} color="#007DBD" />
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={submitting}
              className="py-3 rounded-xl mt-3"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-600 text-base font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}