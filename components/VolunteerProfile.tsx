import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { CommunityPost, deleteCommunityPost, getPostsByVolunteer, getTimeAgo } from '../lib/community';

export default function VolunteerProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const posts = await getPostsByVolunteer(user.$id);
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };


   useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserPosts();
      }
    }, [user])
  );

  const handleCreatePost = () => {
    router.push('/community/create-post' as any);
  };

  const handleEditPost = (postId: string) => {
    router.push(`/community/create-post?postId=${postId}` as any);
  };

  const handleDeletePost = (postId: string, eventTitle: string) => {
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
              await deleteCommunityPost(postId);
              Alert.alert('Success', 'Post deleted successfully!');
              fetchUserPosts(); // Refresh the list
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      {/* Post Image */}
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full h-48 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}
      
      {/* Caption */}
      <Text className="text-gray-800 mb-2 text-base">{item.caption}</Text>
      
      {/* Event Title */}
      <Text className="text-xl font-bold text-blue-900 mb-2">{item.eventTitle}</Text>
      
      {/* Description */}
      <Text className="text-gray-600 mb-3">{item.description}</Text>
      
      {/* Event Details */}
      <View className="bg-gray-50 p-3 rounded-lg mb-3">
        <Text className="text-sm text-gray-700">📅 {item.date} at {item.time}</Text>
        <Text className="text-sm text-gray-700">📍 {item.venue}</Text>
      </View>
      
      {/* Categories */}
      {item.categories && item.categories.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {item.categories.map((category: string, index: number) => (
            <View 
              key={index} 
              className="bg-yellow-100 border border-yellow-500 px-3 py-1 rounded-full mr-2 mb-1"
            >
              <Text className="text-yellow-800 text-xs font-medium">{category}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Time and Actions */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
        <Text className="text-gray-500 text-sm">{getTimeAgo(item.createdAt)}</Text>
        <View className="flex-row">
          <TouchableOpacity 
            onPress={() => handleEditPost(item.$id)}
            className="bg-blue-600 px-3 py-1 rounded mr-2"
          >
            <Text className="text-white text-xs">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeletePost(item.$id, item.eventTitle)}
            className="bg-red-500 px-3 py-1 rounded"
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
        {/* Header */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-blue-900 mb-2">Volunteer Profile</Text>
          <Text className="text-lg text-gray-700 mb-1">Name: {user?.name}</Text>
          <Text className="text-gray-600">Email: {user?.email}</Text>
        </View>

        {/* Create Post Button */}
        <TouchableOpacity 
          onPress={handleCreatePost}
          className="bg-blue-900 p-4 rounded-lg mb-4 shadow-sm"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <Text className="text-white text-center font-semibold text-lg">Create New Post</Text>
        </TouchableOpacity>

        {/* User Posts Section */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-blue-900 mb-3">My Posts ({userPosts.length})</Text>
          
          {loading ? (
            <View className="bg-white p-8 rounded-lg">
              <Text className="text-center text-gray-600">Loading your posts...</Text>
            </View>
          ) : userPosts.length === 0 ? (
            <View className="bg-white p-8 rounded-lg">
              <Text className="text-center text-gray-600">No posts yet. Create your first post!</Text>
            </View>
          ) : (
            <FlatList 
              data={userPosts}
              renderItem={renderPostItem}
              keyExtractor={(item: CommunityPost) => item.$id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

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