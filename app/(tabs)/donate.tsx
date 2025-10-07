import { getAllBeneficiaryPosts } from '@/lib/admin';
import { useAuth } from '@/lib/auth';
import { getDonorPreferences } from '@/lib/donorPreferences';
import { BeneficiaryPost, getAIRecommendations } from '@/lib/recommendations';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DonateFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BeneficiaryPost[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<BeneficiaryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fetchPostsAndRecommendations = async () => {
    try {
      // Fetch all posts
      const response = await getAllBeneficiaryPosts();
      const allPosts = response as BeneficiaryPost[];
      setPosts(allPosts);

      // Get recommendations if user exists
      if (user?.$id) {
        setLoadingRecommendations(true);
        try {
          const prefs = await getDonorPreferences(user.$id);
          const preferences = prefs?.preferences || [];
          
          const recommendations = await getAIRecommendations(allPosts, preferences);
          setRecommendedPosts(recommendations.recommendedPosts);
        } catch (recError) {
          console.error('Error loading recommendations:', recError);
          setRecommendedPosts([]);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostsAndRecommendations();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostsAndRecommendations();
  };

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Horizontal recommendation card (compact version)
  const renderHorizontalCard = (post: BeneficiaryPost) => {
    const progress = calculateProgress(post.collectedAmount || 0, post.goalAmount);

    return (
      <TouchableOpacity
        key={post.$id}
        className="bg-white rounded-xl mr-3 shadow-md overflow-hidden"
        style={{ width: width * 0.7 }}
        onPress={() =>
          router.push({
            pathname: '/donor-hub/donation-details',
            params: { postId: post.$id },
          })
        }
        activeOpacity={0.8}
      >
        {/* Image */}
        <View className="relative w-full h-32 bg-gray-200">
          <Image
            source={{
              uri: post.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 flex-row gap-1">
            <View
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: getUrgencyColor(post.urgencyLevel) }}
            >
              <Text className="text-white text-xs font-bold">
                {post.urgencyLevel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="text-base font-bold text-[#007DBD] mb-1">
            {truncateText(post.beneficiaryName, 25)}
          </Text>
          <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
            {post.description}
          </Text>

          {/* Progress */}
          <View className="mb-2">
            <View className="w-full h-1.5 bg-[#E0EEF7] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#007DBD] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Rs. {(post.collectedAmount || 0).toFixed(0)} / {post.goalAmount.toFixed(0)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Regular vertical card (existing)
  const renderCard = (post: BeneficiaryPost) => {
    const progress = calculateProgress(post.collectedAmount || 0, post.goalAmount);

    return (
      <View key={post.$id} className="bg-white rounded-2xl mb-5 shadow-lg overflow-hidden">
        <View className="relative w-full h-52 bg-gray-200">
          <Image
            source={{
              uri: post.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-3 left-3 flex-row gap-2">
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

        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="account-heart" size={22} color="#007DBD" />
            <Text className="text-xl font-bold text-[#007DBD] ml-2 flex-1">
              {post.beneficiaryName}
            </Text>
          </View>

          <Text className="text-sm text-gray-600 leading-5 mb-3">
            {truncateText(post.description, 100)}
          </Text>

          <View className="mb-4">
            <Text className="text-base font-semibold text-[#007DBD] mb-2">
              Items needed:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              {post.itemsNeeded.slice(0, 3).join(', ')}
              {post.itemsNeeded.length > 3 && '...'}
            </Text>
          </View>

          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={14} color="#007DBD" />
                <Text className="text-xs font-semibold text-gray-700 ml-1">
                  Rs. {(post.collectedAmount || 0).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="flag-outline" size={14} color="#007DBD" />
                <Text className="text-xs font-semibold text-gray-700 ml-1">
                  Rs. {post.goalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="w-full h-2 bg-[#E0EEF7] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#007DBD] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1 font-medium">
              {progress.toFixed(0)}% funded
            </Text>
          </View>

          <View className="flex-row justify-end">
            <TouchableOpacity
              className="bg-[#FFB900] py-3 px-6 rounded-xl flex-row items-center shadow-md"
              onPress={() =>
                router.push({
                  pathname: '/donor-hub/donation-details',
                  params: { postId: post.$id },
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={20} color="#007DBD" />
              <Text className="text-gray-900 text-base font-bold ml-2">
                Donate Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="mt-3 text-base text-[#007DBD] font-medium">
            Loading donation opportunities...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007DBD']} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-3xl font-bold text-[#007DBD] mb-3">
            Make a Difference
          </Text>
          <Text className="text-base text-gray-600 leading-6">
            Your generosity can transform lives. Support those in need and be part of their journey to a better tomorrow.
          </Text>
        </View>

        {/* Recommended Section */}
        {recommendedPosts.length > 0 && (
          <View className="mb-6">
            <View className="px-5 mb-3 flex-row items-center">
              <MaterialCommunityIcons name="star-circle" size={24} color="#FFB900" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Recommended for You
              </Text>
            </View>
            
            {loadingRecommendations ? (
              <View className="px-5 py-8">
                <ActivityIndicator size="small" color="#007DBD" />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {recommendedPosts.map(post => renderHorizontalCard(post))}
              </ScrollView>
            )}
          </View>
        )}

        {/* All Donations */}
        <View className="px-4">
          <Text className="text-xl font-bold text-gray-900 mb-4 ml-1">
            All Opportunities
          </Text>
          
          {posts.length > 0 ? (
            posts.map(post => renderCard(post))
          ) : (
            <View className="py-16 items-center">
              <MaterialCommunityIcons name="heart-broken" size={64} color="#E0EEF7" />
              <Text className="text-base text-gray-500 text-center mt-4">
                No donation opportunities available at the moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DonateFeed;