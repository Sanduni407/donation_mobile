// app/(tabs)/home.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeneficiaryPostData, getAllBeneficiaryPosts } from '../../lib/admin';
import { useAuth } from '../../lib/auth';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BeneficiaryPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      const allPosts = await getAllBeneficiaryPosts();
      // Filter active posts only
      const activePosts = allPosts.filter((post: any) => post.status === 'active');
      setPosts(activePosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const calculateProgress = (collected: number, goal: number) => {
    return Math.min((collected / goal) * 100, 100);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-[#FFB900]';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalRaised = posts.reduce((sum, p: any) => sum + (p.collectedAmount || 0), 0);
  const completedCount = posts.filter((p: any) => (p.collectedAmount || 0) >= p.goalAmount).length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-[#007DBD]">
              Welcome Back!
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {user?.name || 'Guest'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View className="w-12 h-12 rounded-full bg-[#E0EEF7] items-center justify-center border-2 border-[#007DBD]">
              <Text className="text-lg font-bold text-[#007DBD]">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Section - No Image, Just Blue */}
        <View className="mx-5 mt-4 bg-[#007DBD] rounded-2xl p-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Ionicons name="heart" size={32} color="#FFB900" />
            <Text className="text-2xl font-bold text-white ml-3">
              Make a Difference
            </Text>
          </View>
          <Text className="text-white text-base leading-6 opacity-90">
            Join thousands of donors helping those in need. Every contribution
            creates hope and changes lives.
          </Text>
        </View>


         {/* Active Causes Section */}
        <View className="mt-6">
          <View className="px-5 flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Active Causes
            </Text>
            <TouchableOpacity onPress={() => router.push('/donate')}>
              <Text className="text-[#007DBD] font-semibold text-sm">
                See All →
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#007DBD" />
              <Text className="text-gray-500 mt-3">Loading causes...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View className="mx-5 bg-[#E0EEF7] rounded-xl p-8 items-center">
              <Ionicons name="heart-dislike-outline" size={48} color="#007DBD" />
              <Text className="text-gray-700 font-semibold mt-4 text-center">
                No Active Causes
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Check back soon for new opportunities to help
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {posts.map((post: any, index) => {
                const progress = calculateProgress(
                  post.collectedAmount || 0,
                  post.goalAmount
                );
                const remaining = post.goalAmount - (post.collectedAmount || 0);

                return (
                  <TouchableOpacity
                    key={post.$id || index}
                    onPress={() =>
                      router.push({
                        pathname: '/donor-hub/donation-details',
                        params: { postId: post.$id },
                      })
                    }
                    className="mr-4 bg-white rounded-2xl shadow-lg overflow-hidden"
                    style={{ width: 280 }}
                  >
                    {/* Post Image */}
                    {post.imageUrl ? (
                      <Image
                        source={{ uri: post.imageUrl }}
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-40 bg-[#E0EEF7] items-center justify-center">
                        <Ionicons name="image-outline" size={48} color="#007DBD" />
                      </View>
                    )}

                    {/* Urgency Badge - Dynamic Color */}
                    <View className="absolute top-3 right-3">
                      <View className={`px-3 py-1 rounded-full ${getUrgencyColor(post.urgencyLevel)}`}>
                        <Text className="text-white text-xs font-bold">
                          {post.urgencyLevel?.toUpperCase() || 'NORMAL'}
                        </Text>
                      </View>
                    </View>

                    {/* Post Details */}
                    <View className="p-4">
                      <Text className="text-lg font-bold text-gray-900 mb-2">
                        {post.beneficiaryName}
                      </Text>
                      <Text
                        className="text-sm text-gray-600 mb-3"
                        numberOfLines={2}
                      >
                        {post.description}
                      </Text>

                      {/* Progress Bar */}
                      <View className="mb-3">
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-xs font-semibold text-[#007DBD]">
                            Rs. {(post.collectedAmount || 0).toLocaleString()}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            of Rs. {post.goalAmount.toLocaleString()}
                          </Text>
                        </View>
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-[#FFB900] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                          Rs. {remaining.toLocaleString()} remaining
                        </Text>
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        className="bg-[#007DBD] py-3 rounded-xl items-center"
                        onPress={() =>
                          router.push({
                            pathname: '/donor-hub/donation-details',
                            params: { postId: post.$id },
                          })
                        }
                      >
                        <Text className="text-white font-bold text-sm">
                          Donate Now
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

          {/* Our Services Section */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Our Services
          </Text>
          
          {/* Service 1 - Community Platform */}
          <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
            <Image
              source={require('../../assets/images/community.jpg')}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="people-circle" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Community Platform
                </Text>
              </View>
              <Text className="text-sm text-gray-600 leading-5">
                Connect with other donors, share experiences, and build a supportive community dedicated to making a difference together.
              </Text>
            </View>
          </View>

          {/* Service 2 - Educational Workshops */}
          <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
            <Image
              source={require('../../assets/images/workshop.jpg')}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="school" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Educational Workshops
                </Text>
              </View>
              <Text className="text-sm text-gray-600 leading-5">
                Learn about effective giving, financial literacy, and how to maximize your impact through our free educational programs.
              </Text>
            </View>
          </View>

          {/* Service 3 - Volunteer Programs */}
          <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
            <Image
              source={require('../../assets/images/volunteer.jpg')}
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="hand-left" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Volunteer Opportunities
                </Text>
              </View>
              <Text className="text-sm text-gray-600 leading-5">
                Give your time and skills to help those in need. Join our volunteer programs and make a hands-on difference in your community.
              </Text>
            </View>
          </View>
        </View>


       

         {/* What We Offer Grid */}
        <View className="px-5 mt-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            What We Offer
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Feature 1 */}
            <View className="bg-[#E0EEF7] rounded-xl p-4 mb-4 w-[48%]">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-3">
                <Ionicons name="shield-checkmark" size={24} color="#007DBD" />
              </View>
              <Text className="text-base font-bold text-gray-900 mb-1">
                Verified Causes
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                Every request is reviewed and verified by our team
              </Text>
            </View>

            {/* Feature 2 */}
            <View className="bg-[#E0EEF7] rounded-xl p-4 mb-4 w-[48%]">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-3">
                <Ionicons name="lock-closed" size={24} color="#007DBD" />
              </View>
              <Text className="text-base font-bold text-gray-900 mb-1">
                Secure Payments
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                Your donations are processed securely via Stripe
              </Text>
            </View>

            {/* Feature 3 */}
            <View className="bg-[#E0EEF7] rounded-xl p-4 mb-4 w-[48%]">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-3">
                <Ionicons name="eye" size={24} color="#007DBD" />
              </View>
              <Text className="text-base font-bold text-gray-900 mb-1">
                Full Transparency
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                Track where your donations go in real-time
              </Text>
            </View>

            {/* Feature 4 */}
            <View className="bg-[#E0EEF7] rounded-xl p-4 mb-4 w-[48%]">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-3">
                <Ionicons name="people" size={24} color="#007DBD" />
              </View>
              <Text className="text-base font-bold text-gray-900 mb-1">
                Impact Stories
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                See the real impact of your generous contributions
              </Text>
            </View>
          </View>
        </View>


        



      

        
       
        {/* Stats Section */}
        <View className="mx-5 mt-8 mb-6 bg-[#f1f1f1] rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
            Our Impact Together
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Ionicons name="people" size={32} color="#007DBD" />
              <Text className="text-2xl font-bold text-[#007DBD] mt-2">
                {posts.length.toString()}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">Active Causes</Text>
            </View>
            <View className="items-center">
              <Ionicons name="heart" size={32} color="#FFB900" />
              <Text className="text-2xl font-bold text-[#007DBD] mt-2">
                {totalRaised.toFixed(0)}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">Total Raised</Text>
            </View>
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
              <Text className="text-2xl font-bold text-[#007DBD] mt-2">
                {completedCount.toString()}
              </Text>
              <Text className="text-xs text-gray-600 mt-1">Completed</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}