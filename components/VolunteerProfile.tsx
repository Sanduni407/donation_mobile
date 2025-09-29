import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { CommunityPost, deleteCommunityPost, getPostsByVolunteer, getTimeAgo, getUserStats, isVolunteer } from '../lib/community';

export default function VolunteerProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalReactions: 0, totalComments: 0 });

  const userIsVolunteer = user?.prefs ? isVolunteer(user.prefs) : false;
  const userRole = user?.prefs?.role || 'user';

  const getBadgeLevel = (totalPosts: number): string => {
    if (totalPosts >= 5) return 'Gold';
    if (totalPosts >= 4) return 'Silver';
    return 'Bronze';
  };

  const badgeLevel = getBadgeLevel(stats.totalPosts);

  useEffect(() => {
    if (user && userIsVolunteer) {
      fetchUserData();
    } else if (user && !userIsVolunteer) {
      setLoading(false);
    }
  }, [user, userIsVolunteer]);

  const fetchUserData = async () => {
    if (!userIsVolunteer) return;
    
    try {
      setLoading(true);
      const [posts, userStats] = await Promise.all([
        getPostsByVolunteer(user.$id),
        getUserStats(user.$id)
      ]);
      setUserPosts(posts);
      setStats(userStats);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user && userIsVolunteer) {
        fetchUserData();
      }
    }, [user, userIsVolunteer])
  );

  const handleCreatePost = () => {
    if (!userIsVolunteer) {
      Alert.alert(
        'Access Restricted', 
        'Only volunteers can create community posts.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/community/create-post' as any);
  };

  const handleEditPost = (postId: string) => {
    if (!userIsVolunteer) {
      Alert.alert('Error', 'Only volunteers can edit posts');
      return;
    }
    router.push(`/community/create-post?postId=${postId}` as any);
  };

  const handleDeletePost = (postId: string, eventTitle: string) => {
    if (!userIsVolunteer) {
      Alert.alert('Error', 'Only volunteers can delete posts');
      return;
    }

    Alert.alert(
      'Delete Post',
      `Are you sure you want to delete "${eventTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCommunityPost(postId, userRole, user.$id);
              Alert.alert('Success', 'Post deleted successfully!');
              fetchUserData();
            } catch (error: any) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <View className="bg-white rounded-lg p-4 mr-4 shadow-sm border border-gray-200" style={{ width: 300 }}>
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full h-40 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}
      
      <Text className="text-gray-800 mb-2 text-sm" numberOfLines={2}>{item.caption}</Text>
      <Text className="text-lg font-bold text-blue-900 mb-2" numberOfLines={1}>{item.eventTitle}</Text>
      <Text className="text-gray-600 mb-3 text-sm" numberOfLines={3}>{item.description}</Text>
      
      <View className="bg-gray-50 p-2 rounded-lg mb-3">
        <Text className="text-xs text-gray-700">📅 {item.date}</Text>
        <Text className="text-xs text-gray-700">📍 {item.venue}</Text>
      </View>
      
      {item.categories && item.categories.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {item.categories.slice(0, 3).map((category: string, index: number) => (
            <View 
              key={index} 
              className="bg-yellow-100 border border-yellow-500 px-2 py-1 rounded-full mr-1 mb-1"
            >
              <Text className="text-yellow-800 text-xs font-medium">{category}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
        <Text className="text-gray-500 text-xs">{getTimeAgo(item.createdAt)}</Text>
        <View className="flex-row">
          <TouchableOpacity 
            onPress={() => handleEditPost(item.$id)}
            className="px-3 py-2 rounded mr-2"
            style={{ backgroundColor: '#0B1E3D' }}
          >
            <Text className="text-white text-lg">✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeletePost(item.$id, item.eventTitle)}
            className="px-3 py-2 rounded"
            style={{ backgroundColor: '#8B0000' }}
          >
            <Text className="text-white text-lg">🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Enhanced Profile Section with Gradient */}
        <LinearGradient
          colors={['#0B1E3D', '#1E3A5F', '#0B1E3D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 }}>
              My Profile
            </Text>
            <View style={{ width: 64, height: 4, backgroundColor: '#040716ff', borderRadius: 2 }} />
          </View>
          
          {/* Profile Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View 
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: '#FFFFFF',
                borderWidth: 4,
                borderColor: '#d63b18ff',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#0B1E3D' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            
            {/* Welcome Message */}
            <View 
              style={{
                backgroundColor: 'rgba(249, 246, 234, 0.15)',
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(98, 221, 174, 0.3)',
                minWidth: '80%',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4, color: '#FCD34D' }}>
                Welcome Back!
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>
                {user?.name || 'User'}
              </Text>
            </View>
            
            {/* User Details Card */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, marginBottom: 4, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 }}>
                  FULL NAME
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                  {user?.name || 'Not provided'}
                </Text>
              </View>
              
              <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <Text style={{ fontSize: 11, marginBottom: 4, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 }}>
                  EMAIL ADDRESS
                </Text>
                <Text style={{ fontSize: 14, color: '#060a12ff' }}>
                  {user?.email || 'Not provided'}
                </Text>
              </View>
              
              {/* Role Badge */}
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <View 
                  style={{
                    backgroundColor: userIsVolunteer ? '#10B981' : '#3B82F6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 }}>
                    {userIsVolunteer ? '🌟 VOLUNTEER' : '👤 USER'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Create Post Button - Between My Profile and My Stats */}
        {userIsVolunteer && (
          <View className="flex-row justify-end items-center mb-4">
            <View className="items-center">
              <Text className="text-gray-700 font-medium mb-2">Create New Post</Text>
              <TouchableOpacity 
                onPress={handleCreatePost}
                className="rounded-full items-center justify-center shadow-lg"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#0B1E3D',
                  borderWidth: 3,
                  borderColor: '#FF0000'
                }}
              >
                <Text className="text-white text-3xl font-light">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Volunteer-specific features */}
        {userIsVolunteer && (
          <>
            {/* My Stats Section */}
            <View className="bg-blue-900 rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-white mb-3">My Stats</Text>
              
              <View className="flex-row justify-between">
                <View className="bg-yellow-50 border-2 border-red-500 rounded-lg p-4 items-center" style={{ flex: 1, marginRight: 8 }}>
                  <Text className="text-3xl font-bold text-black mb-1">{stats.totalPosts}</Text>
                  <Text className="text-sm text-black">Posts</Text>
                </View>
                
                <View className="bg-yellow-50 border-2 border-red-500 rounded-lg p-4 items-center" style={{ flex: 1, marginHorizontal: 4 }}>
                  <Text className="text-3xl font-bold text-black mb-1">{stats.totalReactions}</Text>
                  <Text className="text-sm text-black">Reactions</Text>
                </View>
                
                <View className="bg-yellow-50 border-2 border-red-500 rounded-lg p-4 items-center" style={{ flex: 1, marginLeft: 8 }}>
                  <Text className="text-3xl font-bold text-black mb-1">{stats.totalComments}</Text>
                  <Text className="text-sm text-black">Comment</Text>
                </View>
              </View>
            </View>

            {/* Badges and Achievements Section */}
            <View className="mb-4">
              <Text className="text-xl font-bold text-blue-900 mb-3">Badges and Achievements</Text>
              
              <View className="bg-blue-900 border-4 border-yellow-500 rounded-lg p-6 items-center">
                <Text className="text-6xl mb-3">🏆</Text>
                <Text className="text-3xl font-bold text-yellow-500 mb-2">{badgeLevel}</Text>
                
                {badgeLevel === 'Gold' && (
                  <Text className="text-center text-yellow-300 text-base mt-2">
                    Congratulations!! You're a gold member now
                  </Text>
                )}
              </View>
            </View>

            {/* User Posts Section - Horizontal Scroll */}
            <View className="mb-4">
              <Text className="text-xl font-bold text-blue-900 mb-3">
                My Posts ({userPosts.length})
              </Text>
              
              {loading ? (
                <View className="bg-white p-8 rounded-lg">
                  <Text className="text-center text-gray-600">Loading your posts...</Text>
                </View>
              ) : userPosts.length === 0 ? (
                <View className="bg-white p-8 rounded-lg">
                  <Text className="text-center text-gray-600">
                    No posts yet. Create your first post!
                  </Text>
                </View>
              ) : (
                <FlatList 
                  data={userPosts}
                  renderItem={renderPostItem}
                  keyExtractor={(item: CommunityPost) => item.$id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                />
              )}
            </View>
          </>
        )}

        {/* Non-volunteer information */}
        {!userIsVolunteer && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">ℹ️</Text>
              <Text className="flex-1 text-blue-800 font-semibold">
                Welcome to the Community!
              </Text>
            </View>
            <Text className="text-blue-700 ml-8">
              You can view, like, and comment on posts in the Community Feed. 
              Only volunteers can create new posts.
            </Text>
          </View>
        )}
      </View>

      {/* Logout Button - At the end of scrollable content */}
      <View className="p-4 pt-8">
        <TouchableOpacity 
          onPress={() => signOut()} 
          className="px-6 py-3 rounded-lg shadow-lg"
          style={{ backgroundColor: '#8B0000', alignSelf: 'flex-start' }}
        >
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}