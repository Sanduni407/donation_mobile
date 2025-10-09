// app/donor-hub/payment.tsx
import { useAuth } from '@/lib/auth';
import { createDonation, updateCollectedAmount } from '@/lib/donations';
import { createPaymentIntent, STRIPE_TEST_CARDS } from '@/lib/stripe';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

  const validateStripeCard = (cardNum: string): { valid: boolean; message: string } => {
    const cleanCard = cardNum.replace(/\s/g, '');
    
    // Check against valid test cards
    const validCards = [
      STRIPE_TEST_CARDS.SUCCESS,
      STRIPE_TEST_CARDS.SUCCESS_DEBIT,
      STRIPE_TEST_CARDS.SUCCESS_MASTERCARD,
    ];

    if (validCards.includes(cleanCard)) {
      return { valid: true, message: 'Success' };
    }

    // Check against decline cards
    const declineCards: { [key: string]: string } = {
      [STRIPE_TEST_CARDS.DECLINE]: 'Card Declined',
      [STRIPE_TEST_CARDS.INSUFFICIENT_FUNDS]: 'Insufficient Funds',
      [STRIPE_TEST_CARDS.EXPIRED_CARD]: 'Expired Card',
      [STRIPE_TEST_CARDS.INCORRECT_CVC]: 'Incorrect CVC',
      [STRIPE_TEST_CARDS.PROCESSING_ERROR]: 'Processing Error',
    };

    if (declineCards[cleanCard]) {
      return { valid: false, message: declineCards[cleanCard] };
    }

    // Any other card
    return { valid: false, message: 'Invalid card. Please use a Stripe test card.' };
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      Alert.alert('Invalid Card', 'Please enter complete card details');
      return;
    }

    setProcessing(true);

    try {
      // Validate card number (silently)
      const validation = validateStripeCard(cardNumber);
      if (!validation.valid) {
        // Directly navigate to error page without throwing
        router.replace({
          pathname: '/donor-hub/payment-error',
          params: {
            errorMessage: validation.message,
          },
        });
        setProcessing(false);
        return;
      }

      // Validate expiry date
      const [month, year] = expiryDate.split('/');
      const expMonth = parseInt(month);
      const expYear = parseInt('20' + year);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (expMonth < 1 || expMonth > 12) {
        throw new Error('Invalid expiry month');
      }

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        throw new Error('Card has expired');
      }

      console.log('✅ Step 2: Card validated');
      console.log('💳 Step 3: Creating and confirming payment...');

      // Create and confirm Payment Intent via Appwrite function
      const { clientSecret, paymentIntentId, status } = await createPaymentIntent({
        amount: parseFloat(amountUSD as string),
        currency: 'usd',
        cardDetails: {
          number: cardNumber.replace(/\s/g, ''),
          expMonth: expMonth,
          expYear: expYear,
          cvc: cvc,
        },
        metadata: {
          postId: postId as string,
          beneficiaryCode: beneficiaryCode as string,
          donorId: user.$id,
          donorName: user.name || 'Anonymous',
          beneficiaryName: beneficiaryName as string,
        },
      });

      console.log('✅ Step 4: Payment confirmed:', paymentIntentId);
      console.log('💳 Payment status:', status);

      if (status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      console.log('📝 Step 5: Creating donation record...');

      // Create donation record in Appwrite
      const donationData = {
        donorId: user.$id,
        postId: postId as string,
        beneficiaryRequestCode: beneficiaryCode as string,
        amountLKR: parseFloat(amountLKR as string),
        amountUSD: parseFloat(amountUSD as string),
        paymentIntentId: paymentIntentId,
        paymentStatus: 'succeeded' as const,
        donorName: user.name || 'Anonymous',
        beneficiaryName: beneficiaryName as string,
      };

      const donation = await createDonation(donationData);
      console.log('✅ Step 6: Donation created:', donation.$id);

      // Update beneficiary post collected amount
      console.log('💰 Step 7: Updating collected amount...');
      await updateCollectedAmount(
        postId as string,
        parseFloat(amountLKR as string)
      );

      console.log('🎉 Step 8: Payment complete! Navigating to success...');

      // Navigate to success screen
      router.replace({
        pathname: '/donor-hub/payment-success',
        params: {
          donationId: donation.$id,
          amountLKR: amountLKR as string,
          beneficiaryName: beneficiaryName as string,
          beneficiaryCode: beneficiaryCode as string,
          paymentIntentId: paymentIntentId,
        },
      });
    } catch (error: any) {
      console.error('❌ Payment error:', error);

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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-5 py-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              <Text className="font-semibold text-gray-900">
                {beneficiaryName}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700">Code:</Text>
              <Text className="font-semibold text-gray-900">
                {beneficiaryCode}
              </Text>
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
                placeholder="4242 4242 4242 4242"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                maxLength={19}
                editable={!processing}
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
                  editable={!processing}
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
                  onChangeText={(text) =>
                    setCvc(text.replace(/\D/g, '').substring(0, 3))
                  }
                  maxLength={3}
                  secureTextEntry
                  editable={!processing}
                />
              </View>
            </View>
          </View>

          {/* Security Info */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <Text className="text-xs text-gray-600 text-center leading-5">
              🔒 Your payment is securely processed by Stripe. This is a test
              environment for demonstration purposes.
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
              <View className="flex-row items-center">
                <ActivityIndicator color="#007DBD" />
                <Text className="text-gray-700 text-base font-semibold ml-3">
                  Processing Payment...
                </Text>
              </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;