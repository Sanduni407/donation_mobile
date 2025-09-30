// app/donor-hub/enter-donation-amount.tsx
import { getBeneficiaryPostById } from '@/lib/admin';
import { convertLKRtoUSD } from '@/lib/donations';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EnterDonationAmount = () => {
  const { postId } = useLocalSearchParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getBeneficiaryPostById(postId as string);
        setPost(response);
      } catch (error) {
        console.error('Error loading post:', error);
        Alert.alert('Error', 'Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const quickAmounts = [500, 1000, 2500, 5000];

  const handleProceedToPayment = () => {
    const donationAmount = parseFloat(amount);

    if (!amount || isNaN(donationAmount) || donationAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount');
      return;
    }

    if (donationAmount < 100) {
      Alert.alert('Minimum Amount', 'Minimum donation amount is Rs. 100');
      return;
    }

    // Convert to USD for Stripe
    const amountUSD = convertLKRtoUSD(donationAmount);

    // Navigate to payment screen with details
    router.push({
      pathname: '/donor-hub/payment',
      params: {
        postId: postId as string,
        amountLKR: donationAmount.toString(),
        amountUSD: amountUSD.toString(),
        beneficiaryName: post?.beneficiaryName || '',
        beneficiaryCode: post?.beneficiaryRequestCode || '',
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007DBD" />
        </View>
      </SafeAreaView>
    );
  }

  const remainingAmount = (post?.goalAmount || 0) - (post?.collectedAmount || 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#007DBD" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#007DBD]">Enter Donation Amount</Text>
      </View>

      {/* Scrollable Content */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Beneficiary Info */}
          <View className="bg-[#E0EEF7] p-4 rounded-xl mb-6">
            <Text className="text-sm text-gray-600 mb-1">You're donating to:</Text>
            <Text className="text-lg font-bold text-[#007DBD] mb-1">
              {post?.beneficiaryName}
            </Text>
            <Text className="text-xs text-gray-500">
              Code: {post?.beneficiaryRequestCode}
            </Text>
          </View>

          {/* Remaining Amount Info */}
          <View className="bg-[#FFF9E6] border border-[#FFB900] p-4 rounded-xl mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#FFB900" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Amount Needed
              </Text>
            </View>
            <Text className="text-2xl font-bold text-[#007DBD]">
              Rs. {remainingAmount.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              Goal: Rs. {post?.goalAmount?.toFixed(2)} | Raised: Rs.{' '}
              {(post?.collectedAmount || 0).toFixed(2)}
            </Text>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-3">
              Enter Amount (LKR)
            </Text>
            <View className="flex-row items-center bg-[#E0EEF7] rounded-xl px-4 py-2 border-2 border-[#007DBD]">
              <Text className="text-2xl font-bold text-[#007DBD] mr-2">Rs.</Text>
              <TextInput
                className="flex-1 text-2xl font-bold text-gray-900"
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {amount && parseFloat(amount) > 0 && (
              <Text className="text-xs text-gray-500 mt-2">
                ≈ ${convertLKRtoUSD(parseFloat(amount)).toFixed(2)} USD
              </Text>
            )}
          </View>

          {/* Quick Amount Buttons */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-600 mb-3">
              Quick Select
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  className="bg-white border-2 border-[#007DBD] px-4 py-3 rounded-xl"
                  onPress={() => setAmount(quickAmount.toString())}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#007DBD] font-bold">
                    Rs. {quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Note */}
          <View className="bg-gray-50 p-4 rounded-xl mb-6">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={18} color="#007DBD" />
              <Text className="flex-1 text-xs text-gray-600 leading-5 ml-2">
                Your donation is secure and will go directly to helping{' '}
                {post?.beneficiaryName}. You'll receive a receipt after payment.
              </Text>
            </View>
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            className={`py-4 px-6 rounded-xl flex-row items-center justify-center ${
              !amount || parseFloat(amount) <= 0
                ? 'bg-gray-300'
                : 'bg-[#FFB900]'
            }`}
            onPress={handleProceedToPayment}
            disabled={!amount || parseFloat(amount) <= 0 || processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator color="#007DBD" />
            ) : (
              <>
                <Text className="text-gray-900 text-lg font-bold mr-2">
                  Proceed to Payment
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#007DBD" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default EnterDonationAmount;