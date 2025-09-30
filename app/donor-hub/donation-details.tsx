import { getBeneficiaryPostById } from '@/lib/admin';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BeneficiaryPost = {
  $id: string;
  helpRequestId: string;
  beneficiaryRequestCode: string;
  beneficiaryName: string;
  description: string;
  itemsNeeded: string[];
  goalAmount: number;
  urgencyLevel: string;
  collectedAmount?: number;
  status?: string;
  imageUrl?: string;
};

const DonationDetails = () => {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<BeneficiaryPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await getBeneficiaryPostById(postId as string);
        setPost(response as BeneficiaryPost);
      } catch (error) {
        console.error('Error loading post details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'urgent':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#FFB900';
      case 'low':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#16A34A';
      case 'completed':
        return '#007DBD';
      case 'closed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const calculateProgress = (collected: number, goal: number) => {
    return Math.min((collected / goal) * 100, 100);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="mt-3 text-base text-[#007DBD] font-medium">
            Loading details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 justify-center items-center p-5">
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#6B7280" />
          <Text className="text-lg text-gray-500 mb-5 mt-4">Post not found</Text>
          <TouchableOpacity
            className="bg-[#007DBD] px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white text-base font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress(
    post.collectedAmount || 0,
    post.goalAmount
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View className="relative w-full h-80 bg-gray-200">
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 justify-center items-center z-10 shadow-md"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#007DBD" />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                post.imageUrl ||
                'https://via.placeholder.com/400x300?text=No+Image',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 right-4 gap-2">
            <View
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: getStatusColor(post.status || 'active') }}
            >
              <Text className="text-white text-xs font-bold tracking-wider">
                {(post.status || 'active').toUpperCase()}
              </Text>
            </View>
            <View
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: getUrgencyColor(post.urgencyLevel) }}
            >
              <Text className="text-white text-xs font-bold tracking-wider">
                {post.urgencyLevel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-5">
          {/* Intro Text - REMOVED information-circle icon */}
          <View className="bg-[#E0EEF7] p-4 rounded-xl mb-6">
            <Text className="text-sm text-gray-700 leading-6 text-center italic">
              Your support can make a real difference in someone's life. Every contribution brings hope and relief to those who need it most.
            </Text>
          </View>

          {/* Beneficiary Info */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="account-circle" size={24} color="#007DBD" />
              <Text className="text-lg font-bold text-[#007DBD] ml-2">Beneficiary</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {post.beneficiaryName}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-500 font-medium ml-1">
                Code: {post.beneficiaryRequestCode}
              </Text>
            </View>
          </View>

          {/* Description - REMOVED reader-outline icon */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-[#007DBD] mb-3">About This Request</Text>
            <Text className="text-sm text-gray-600 leading-6">{post.description}</Text>
          </View>

          {/* Items Needed - REMOVED list-circle-outline icon */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-[#007DBD] mb-3">Items Needed</Text>
            <View className="gap-2">
              {post.itemsNeeded.map((item, index) => (
                <View key={index} className="flex-row items-start bg-[#E0EEF7] p-3 rounded-lg">
                  <Ionicons name="checkmark-circle" size={20} color="#007DBD" />
                  <Text className="flex-1 text-sm text-gray-700 leading-5 ml-2">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Funding Progress - REMOVED chart-line icon */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-[#007DBD] mb-3">Funding Progress</Text>
            <View className="bg-[#E0EEF7] p-5 rounded-xl">
              <View className="flex-row justify-around mb-5">
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="wallet-outline" size={18} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">Raised</Text>
                  </View>
                  <Text className="text-xl font-bold text-[#007DBD]">
                    Rs. {(post.collectedAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View className="w-px bg-[#007DBD] opacity-30" />
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="trophy-outline" size={18} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">Goal</Text>
                  </View>
                  <Text className="text-xl font-bold text-[#007DBD]">
                    Rs. {post.goalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="mb-3">
                <View className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full bg-[#007DBD] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <Text className="text-sm text-[#007DBD] font-semibold text-center">
                  {progress.toFixed(1)}% funded
                </Text>
              </View>

              <View className="flex-row items-center justify-center">
                <Ionicons name="trending-up" size={16} color="#4B5563" />
                <Text className="text-sm text-gray-600 font-medium ml-1">
                  Rs. {(post.goalAmount - (post.collectedAmount || 0)).toFixed(2)} more needed
                </Text>
              </View>
            </View>
          </View>

          {/* Donate Button */}
  
       <TouchableOpacity
          className="bg-[#FFB900] py-4 px-6 rounded-xl flex-row items-center justify-center shadow-lg mb-4"
          onPress={() =>
          router.push({
          pathname: '/donor-hub/enter-donation-amount',
          params: { postId: post.$id },
          })
          }
        activeOpacity={0.8}
        >
       <Ionicons name="heart" size={24} color="#007DBD" />
      <Text className="text-gray-900 text-lg font-bold ml-2 tracking-wide">
         Donate Now
      </Text>
     </TouchableOpacity>
          {/* Help Text */}
          <View className="flex-row items-center justify-center">
            <Ionicons name="shield-checkmark" size={16} color="#6B7280" />
            <Text className="flex-1 text-xs text-gray-500 text-center leading-5 ml-2">
              Your donation will go directly to helping {post.beneficiaryName} and will make an immediate impact.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DonationDetails;