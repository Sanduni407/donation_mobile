// app/donor-hub/payment-success.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentSuccess = () => {
  const { donationId, amountLKR, beneficiaryName, beneficiaryCode, paymentIntentId } =
    useLocalSearchParams();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 py-6">
        {/* Success Icon */}
        <View className="items-center mb-8 mt-8">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Thank you for your generous donation
          </Text>
        </View>

        {/* Payment Receipt */}
        <View className="bg-[#E0EEF7] rounded-xl p-5 mb-6">
          <Text className="text-lg font-bold text-[#007DBD] mb-4 text-center">
            Payment Receipt
          </Text>

          {/* Amount */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-sm text-gray-600 text-center mb-1">
              Donation Amount
            </Text>
            <Text className="text-3xl font-bold text-[#007DBD] text-center">
              Rs. {parseFloat(amountLKR as string).toFixed(2)}
            </Text>
          </View>

          {/* Details */}
          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Beneficiary:</Text>
              <Text className="text-sm font-semibold text-gray-900 text-right flex-1 ml-2">
                {beneficiaryName}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Request Code:</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {beneficiaryCode}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Transaction ID:</Text>
              <Text className="text-xs font-mono text-gray-900">
                {(paymentIntentId as string).substring(0, 20)}...
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Date & Time:</Text>
              <Text className="text-xs text-gray-900 text-right flex-1 ml-2">
                {currentDate}
              </Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600">Status:</Text>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text className="text-sm font-semibold text-green-600 ml-1">
                  Completed
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Impact Message */}
        <View className="bg-[#FFF9E6] border border-[#FFB900] p-4 rounded-xl mb-6">
          <View className="flex-row items-start">
            <Ionicons name="heart" size={20} color="#FFB900" />
            <Text className="flex-1 text-sm text-gray-700 ml-2 leading-5">
              Your generous donation will directly help {beneficiaryName} and make a
              meaningful difference in their life. Thank you for your kindness!
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View>
          <TouchableOpacity
            className="bg-[#007DBD] py-4 px-6 rounded-xl items-center mb-3"
            onPress={() => router.push('/(tabs)/donate')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">
              Back to Donations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-[#007DBD] py-4 px-6 rounded-xl items-center"
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Text className="text-[#007DBD] text-base font-bold">
              View My Donations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-gray-500 text-center">
            A confirmation email has been sent to your registered email address
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentSuccess;