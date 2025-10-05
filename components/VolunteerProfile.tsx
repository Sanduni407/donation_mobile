import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Award, Calendar, Edit2, Heart, MapPin, MessageCircle, Plus, Star, Target, Trash2, TrendingUp, Users } from 'lucide-react-native';
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
    <View className="bg-white rounded-xl p-4 mr-4 shadow-md border border-gray-100" style={{ width: 300 }}>
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full h-40 rounded-xl mb-3"
          resizeMode="cover"
        />
      )}
      
      <Text className="text-gray-700 mb-2 text-sm font-medium" numberOfLines={2}>{item.caption}</Text>
      <Text className="text-lg font-bold mb-2" style={{ color: '#007DBD' }} numberOfLines={1}>{item.eventTitle}</Text>
      <Text className="text-gray-600 mb-3 text-sm" numberOfLines={3}>{item.description}</Text>
      
      <View className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#E0EEF7' }}>
        <View className="flex-row items-center mb-1">
          <Calendar size={14} color="#007DBD" />
          <Text className="text-xs text-gray-700 ml-2">{item.date} at {item.time}</Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={14} color="#007DBD" />
          <Text className="text-xs text-gray-700 ml-2">{item.venue}</Text>
        </View>
      </View>
      
      {item.categories && item.categories.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {item.categories.slice(0, 3).map((category: string, index: number) => (
            <View 
              key={index} 
              className="px-3 py-1 rounded-full mr-2 mb-1"
              style={{ backgroundColor: '#FFB900' }}
            >
              <Text className="text-xs font-semibold text-black">{category}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Text className="text-gray-500 text-xs">{getTimeAgo(item.createdAt)}</Text>
        <View className="flex-row">
          <TouchableOpacity 
            onPress={() => handleEditPost(item.$id)}
            className="px-3 py-2 rounded-lg mr-2 flex-row items-center"
            style={{ backgroundColor: '#007DBD' }}
          >
            <Edit2 size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeletePost(item.$id, item.eventTitle)}
            className="px-3 py-2 rounded-lg flex-row items-center"
            style={{ backgroundColor: '#DC2626' }}
          >
            <Trash2 size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Enhanced Profile Section */}
        <View
          style={{
            backgroundColor: '#E0EEF7',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#007DBD',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#007DBD', marginBottom: 6 }}>
                My Profile
              </Text>
              <View style={{ width: 60, height: 4, backgroundColor: '#FFB900', borderRadius: 2 }} />
            </View>
            
            {/* Modified Avatar - Smaller size, no yellow border, dark blue background */}
            <View 
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#007DBD',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#007DBD',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          
          {/* Enhanced User Info Card */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <View className="flex-row items-center mb-2">
                  <Users size={14} color="#007DBD" />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#007DBD', letterSpacing: 0.5, marginLeft: 6 }}>
                    NAME
                  </Text>
                </View>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#000000' }}>
                  {user?.name || 'Not provided'}
                </Text>
              </View>
              
              <View 
                style={{
                  backgroundColor: userIsVolunteer ? '#FFB900' : '#007DBD',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              >
                {userIsVolunteer ? (
                  <Star size={12} color="#000000" fill="#000000" style={{ marginRight: 4 }} />
                ) : (
                  <Users size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                )}
                <Text style={{ color: userIsVolunteer ? '#000000' : '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 }}>
                  {userIsVolunteer ? 'VOLUNTEER' : 'USER'}
                </Text>
              </View>
            </View>
            
            <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0EEF7' }}>
              <View className="flex-row items-center mb-2">
                <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>📧</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#007DBD', letterSpacing: 0.5, marginLeft: 6 }}>
                  EMAIL
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: '#000000', fontWeight: '500', marginLeft: 24 }} numberOfLines={1}>
                {user?.email || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Create Post Button */}
        {userIsVolunteer && (
          <View className="flex-row justify-end items-center mb-4">
            <View className="items-center">
              <Text className="font-semibold mb-2" style={{ color: '#007DBD', fontSize: 13, letterSpacing: 0.3 }}>
                Create New Post
              </Text>
              <TouchableOpacity 
                onPress={handleCreatePost}
                className="rounded-full items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#164b65ff',
                  shadowColor: '#007DBD',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  borderWidth: 2,
                  borderColor: '#E0EEF7',
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
            {/* Enhanced My Stats Section */}
            <View className="rounded-xl p-5 mb-10 shadow-md" style={{ backgroundColor: '#007DBD' }}>
              <View className="flex-row items-center mb-4">
                <TrendingUp size={24} color="#FFB900" />
                <Text className="text-2xl font-bold text-white ml-2">My Stats</Text>
              </View>
              
              <Text className="text-white text-sm mb-4 opacity-90">
                Track your community impact and engagement across all your volunteer activities
              </Text>
              
              <View className="flex-row justify-between">
                <View className="rounded-xl p-4 items-center justify-center" style={{ flex: 1, marginRight: 6, backgroundColor: '#E0EEF7' }}>
                  <View className="mb-2">
                    <Target size={24} color="#007DBD" />
                  </View>
                  <Text className="text-3xl font-bold mb-1" style={{ color: '#007DBD' }}>{stats.totalPosts}</Text>
                  <Text className="text-xs font-semibold" style={{ color: '#000000' }}>Posts Created</Text>
                </View>
                
                <View className="rounded-xl p-4 items-center justify-center" style={{ flex: 1, marginHorizontal: 3, backgroundColor: '#E0EEF7' }}>
                  <View className="mb-2">
                    <Heart size={24} color="#DC2626" />
                  </View>
                  <Text className="text-3xl font-bold mb-1" style={{ color: '#007DBD' }}>{stats.totalReactions}</Text>
                  <Text className="text-xs font-semibold" style={{ color: '#000000' }}>Reactions</Text>
                </View>
                
                <View className="rounded-xl p-4 items-center justify-center" style={{ flex: 1, marginLeft: 6, backgroundColor: '#E0EEF7' }}>
                  <View className="mb-2">
                    <MessageCircle size={24} color="#007DBD" />
                  </View>
                  <Text className="text-3xl font-bold mb-1" style={{ color: '#007DBD' }}>{stats.totalComments}</Text>
                  <Text className="text-xs font-semibold" style={{ color: '#000000' }}>Comments</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Badges Section */}
            <View className="mb-10">
              <View className="flex-row items-center mb-3">
                <Award size={24} color="#007DBD" />
                <Text className="text-2xl font-bold ml-2" style={{ color: '#007DBD' }}>Badges & Achievements</Text>
              </View>
              
              <View className="rounded-xl p-6 items-center" style={{ 
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: '#E0EEF7',
                shadowColor: '#007DBD',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#E0EEF7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  borderWidth: 4,
                  borderColor: badgeLevel === 'Gold' ? '#FFB900' : badgeLevel === 'Silver' ? '#C0C0C0' : '#CD7F32',
                }}>
                  <Award size={50} color={badgeLevel === 'Gold' ? '#FFB900' : badgeLevel === 'Silver' ? '#C0C0C0' : '#CD7F32'} fill={badgeLevel === 'Gold' ? '#FFB900' : 'transparent'} />
                </View>
                
                <Text className="text-4xl font-extrabold mb-2" style={{ 
                  color: badgeLevel === 'Gold' ? '#FFB900' : badgeLevel === 'Silver' ? '#9CA3AF' : '#CD7F32' 
                }}>
                  {badgeLevel} Member
                </Text>
                
                <Text className="text-center text-sm text-gray-600 mb-3 px-4">
                  {badgeLevel === 'Gold' 
                    ? 'Congratulations! You\'ve achieved the highest honor as a Gold member for your outstanding contributions'
                    : badgeLevel === 'Silver'
                    ? 'Great work! Keep going to reach Gold status. Just one more post needed!'
                    : 'Welcome! Share your impact to earn Silver and Gold badges'}
                </Text>
                
                <View style={{
                  backgroundColor: '#E0EEF7',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginTop: 8,
                }}>
                  <Text className="text-xs font-bold" style={{ color: '#007DBD' }}>
                    {stats.totalPosts} / 5 Posts to Gold
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced User Posts Section */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#007DBD',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    <Text className="text-white font-bold">{userPosts.length}</Text>
                  </View>
                  <Text className="text-2xl font-bold" style={{ color: '#007DBD' }}>
                    My Posts
                  </Text>
                </View>
              </View>
              
              {loading ? (
                <View className="bg-white p-8 rounded-xl">
                  <Text className="text-center text-gray-600">Loading your posts...</Text>
                </View>
              ) : userPosts.length === 0 ? (
                <View className="bg-white p-8 rounded-xl items-center" style={{ borderWidth: 2, borderColor: '#E0EEF7', borderStyle: 'dashed' }}>
                  <Plus size={48} color="#007DBD" strokeWidth={1.5} />
                  <Text className="text-center text-gray-600 mt-4 font-medium">
                    No posts yet. Create your first post to start sharing your impact!
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

        {/* Enhanced Non-volunteer information */}
        {!userIsVolunteer && (
          <View className="rounded-xl p-5 mb-4" style={{ backgroundColor: '#E0EEF7', borderWidth: 2, borderColor: '#007DBD' }}>
            <View className="flex-row items-center mb-3">
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#007DBD',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={24} color="#FFFFFF" />
              </View>
              <Text className="flex-1 font-bold text-lg ml-3" style={{ color: '#007DBD' }}>
                Welcome to the Community!
              </Text>
            </View>
            <Text className="text-sm leading-5" style={{ color: '#000000' }}>
              You can view, like, and comment on posts in the Community Feed. 
              Only volunteers can create new posts to share their initiatives and events.
            </Text>
          </View>
        )}
      </View>

      {/* Logout Button - Original Format */}
      <View className="p-4 pt-8">
        <TouchableOpacity 
          onPress={() => signOut()} 
          className="px-5 py-2.5 rounded-lg shadow-lg"
          style={{ backgroundColor: '#8B0000', alignSelf: 'flex-start' }}
        >
          <Text className="text-white font-semibold text-sm">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}