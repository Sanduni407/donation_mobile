// app/donor-hub/payment.tsx
import { useAuth } from '@/lib/auth';
import { createDonation, updateCollectedAmount } from '@/lib/donations';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentScreen = () => {
  const { postId, amountLKR, amountUSD, beneficiaryName, beneficiaryCode } =
    useLocalSearchParams();
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const { user } = useAuth();

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const isFormValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    const cleanedExpiry = expiryDate.replace(/\D/g, '');
    return (
      cleanedCardNumber.length === 16 &&
      cleanedExpiry.length === 4 &&
      cvc.length === 3
    );
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For testing purposes, create a mock payment intent ID
      const mockPaymentIntentId = `pi_test_${Date.now()}`;

      // Create donation record in Appwrite
      const donationData = {
        donorId: user.$id,
        postId: postId as string,
        beneficiaryRequestCode: beneficiaryCode as string,
        amountLKR: parseFloat(amountLKR as string),
        amountUSD: parseFloat(amountUSD as string),
        paymentIntentId: mockPaymentIntentId,
        paymentStatus: 'succeeded' as const,
        donorName: user.name || 'Anonymous',
        beneficiaryName: beneficiaryName as string,
      };

      const donation = await createDonation(donationData);

      // Update beneficiary post collected amount
      await updateCollectedAmount(
        postId as string,
        parseFloat(amountLKR as string)
      );

      // Navigate to success screen
      router.replace({
        pathname: '/donor-hub/payment-success',
        params: {
          donationId: donation.$id,
          amountLKR: amountLKR as string,
          beneficiaryName: beneficiaryName as string,
          beneficiaryCode: beneficiaryCode as string,
          paymentIntentId: mockPaymentIntentId,
        },
      });
    } catch (error: any) {
      console.error('Payment error:', error);

      // Navigate to error screen
      router.replace({
        pathname: '/donor-hub/payment-error',
        params: {
          errorMessage: error.message || 'Payment failed',
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-5 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-[#007DBD] mb-2">
            Complete Payment
          </Text>
          <Text className="text-sm text-gray-600">
            Enter your card details to complete the donation
          </Text>
        </View>

        {/* Payment Summary */}
        <View className="bg-[#E0EEF7] p-5 rounded-xl mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-600">Payment Summary</Text>
            <Ionicons name="heart" size={24} color="#FFB900" />
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700">Beneficiary:</Text>
            <Text className="font-semibold text-gray-900">{beneficiaryName}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700">Code:</Text>
            <Text className="font-semibold text-gray-900">{beneficiaryCode}</Text>
          </View>
          <View className="h-px bg-gray-300 my-3" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-[#007DBD]">Amount:</Text>
            <View>
              <Text className="text-lg font-bold text-[#007DBD]">
                Rs. {parseFloat(amountLKR as string).toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-500 text-right">
                ≈ ${parseFloat(amountUSD as string).toFixed(2)} USD
              </Text>
            </View>
          </View>
        </View>

        {/* Card Details */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">
            Card Details
          </Text>

          {/* Card Number */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Card Number</Text>
            <TextInput
              className="bg-white border-2 border-[#007DBD] rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              maxLength={19}
            />
          </View>

          {/* Expiry and CVC */}
          <View className="flex-row gap-3">
            {/* Expiry Date */}
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">Expiry Date</Text>
              <TextInput
                className="bg-white border-2 border-[#007DBD] rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                maxLength={5}
              />
            </View>

            {/* CVC */}
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">CVC</Text>
              <TextInput
                className="bg-white border-2 border-[#007DBD] rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cvc}
                onChangeText={(text) => setCvc(text.replace(/\D/g, '').substring(0, 3))}
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View className="bg-gray-50 p-4 rounded-xl mb-6">
          <Text className="text-xs text-gray-600 text-center leading-5">
            Your payment is secure and encrypted. This is a test environment
            for demonstration purposes.
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          className={`py-4 px-6 rounded-xl items-center justify-center ${
            !isFormValid() || processing ? 'bg-gray-300' : 'bg-[#FFB900]'
          }`}
          onPress={handlePayment}
          disabled={!isFormValid() || processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color="#007DBD" />
          ) : (
            <Text className="text-gray-900 text-lg font-bold">
              Pay Rs. {parseFloat(amountLKR as string).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          className="py-3 items-center mt-4"
          onPress={() => router.back()}
          disabled={processing}
        >
          <Text className="text-gray-500 text-base">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;