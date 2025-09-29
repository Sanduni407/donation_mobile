import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { CommunityPost, deleteCommunityPost, getPostsByVolunteer, getTimeAgo, isVolunteer } from '../lib/community';

export default function VolunteerProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const userIsVolunteer = user?.prefs ? isVolunteer(user.prefs) : false;
  const userRole = user?.prefs?.role || 'user';

  useEffect(() => {
    if (user && userIsVolunteer) {
      fetchUserPosts();
    } else if (user && !userIsVolunteer) {
      setLoading(false);
    }
  }, [user, userIsVolunteer]);

  const fetchUserPosts = async () => {
    if (!userIsVolunteer) return;
    
    try {
      setLoading(true);
      const posts = await getPostsByVolunteer(user.$id);
      setUserPosts(posts);
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user && userIsVolunteer) {
        fetchUserPosts();
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
              fetchUserPosts();
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
            className="bg-blue-600 px-2 py-1 rounded mr-2"
          >
            <Text className="text-white text-xs">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeletePost(item.$id, item.eventTitle)}
            className="bg-red-500 px-2 py-1 rounded"
          >
            <Text className="text-white text-xs">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header with Profile */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm items-center">
          <Text className="text-2xl font-bold text-blue-900 mb-4">My Profile</Text>
          
          {/* Profile Icon */}
          <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center mb-3">
            <Text className="text-white text-4xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          {/* Welcome Message */}
          <Text className="text-lg text-gray-600 mb-1">
            Welcome {user?.name || 'User'}
          </Text>
          
          {/* Name */}
          <Text className="text-base text-gray-800 font-medium mb-1">
            {user?.name}
          </Text>
          
          {/* Email */}
          <Text className="text-sm text-gray-600">
            {user?.email}
          </Text>
        </View>

        {/* Volunteer-specific features */}
        {userIsVolunteer && (
          <>
            {/* Create Post Button */}
            <TouchableOpacity 
              onPress={handleCreatePost}
              className="bg-blue-900 p-4 rounded-lg mb-4 shadow-sm"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Create New Post
              </Text>
            </TouchableOpacity>

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

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={() => signOut()} 
          className="bg-red-500 p-3 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}