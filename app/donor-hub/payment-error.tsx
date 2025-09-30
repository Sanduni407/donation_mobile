// app/donor-hub/payment-error.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentError = () => {
  const { errorMessage } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 py-6">
        {/* Error Icon */}
        <View className="items-center mb-8 mt-8">
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="close-circle" size={64} color="#DC2626" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </Text>
          <Text className="text-base text-gray-600 text-center px-4">
            We couldn't process your payment. Please try again.
          </Text>
        </View>

        {/* Error Details */}
        <View className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <View className="flex-row items-start mb-3">
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text className="text-sm font-semibold text-red-800 ml-2">
              Error Details
            </Text>
          </View>
          <Text className="text-sm text-red-700 leading-5">
            {errorMessage || 'An unexpected error occurred during payment processing'}
          </Text>
        </View>

        {/* Common Reasons */}
        <View className="bg-gray-50 rounded-xl p-5 mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Common Reasons for Payment Failure:
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Ionicons name="ellipse" size={8} color="#6B7280" style={{ marginTop: 6 }} />
              <Text className="flex-1 text-sm text-gray-600 ml-2 leading-5">
                Insufficient funds in your account
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="ellipse" size={8} color="#6B7280" style={{ marginTop: 6 }} />
              <Text className="flex-1 text-sm text-gray-600 ml-2 leading-5">
                Incorrect card details entered
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="ellipse" size={8} color="#6B7280" style={{ marginTop: 6 }} />
              <Text className="flex-1 text-sm text-gray-600 ml-2 leading-5">
                Card expired or blocked
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="ellipse" size={8} color="#6B7280" style={{ marginTop: 6 }} />
              <Text className="flex-1 text-sm text-gray-600 ml-2 leading-5">
                Network connectivity issues
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-[#FFB900] py-4 px-6 rounded-xl items-center flex-row justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#007DBD" />
            <Text className="text-gray-900 text-base font-bold ml-2">
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-[#007DBD] py-4 px-6 rounded-xl items-center"
            onPress={() => router.push('/(tabs)/donate')}
            activeOpacity={0.8}
          >
            <Text className="text-[#007DBD] text-base font-bold">
              Back to Donations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View className="mt-8 bg-[#E0EEF7] p-4 rounded-xl">
          <View className="flex-row items-start">
            <Ionicons name="help-circle" size={20} color="#007DBD" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Need Help?
              </Text>
              <Text className="text-xs text-gray-600 leading-5">
                If you continue to experience issues, please contact our support team
                for assistance.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentError;