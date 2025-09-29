import { useAuth } from '@/lib/auth';
import {
  Comment,
  CommunityPost,
  addComment,
  addReaction,
  getAllCommunityPosts,
  getCommentsByPostId,
  getTimeAgo,
  isVolunteer,
  removeReaction
} from '@/lib/community';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CommunityFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const userIsVolunteer = user?.prefs ? isVolunteer(user.prefs) : false;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await getAllCommunityPosts(user?.$id);
      setPosts(allPosts);
    } catch (error: any) {
      console.error('Error fetching community posts:', error);
      Alert.alert('Error', `Failed to load community posts: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchPosts();
      }
    }, [user])
  );

  const handleReaction = async (postId: string, hasUserReacted: boolean) => {
    try {
      if (hasUserReacted) {
        await removeReaction(postId, user.$id);
      } else {
        await addReaction(postId, user.$id, user.name);
      }
      await fetchPosts();
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      Alert.alert('Error', 'Failed to update reaction');
    }
  };

  const openCommentModal = async (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    setLoadingComments(true);
    
    try {
      const postComments = await getCommentsByPostId(postId);
      setComments(postComments);
    } catch (error: any) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId('');
    setComments([]);
    setNewComment('');
  };

  const submitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(selectedPostId, user.$id, user.name, newComment.trim());
      setNewComment('');
      
      const updatedComments = await getCommentsByPostId(selectedPostId);
      setComments(updatedComments);
      
      await fetchPosts();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2 px-4">
        <View className="bg-blue-600 rounded-full w-10 h-10 items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">
            {item.volunteerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{item.volunteerName}</Text>
          <Text className="text-gray-500 text-sm">{getTimeAgo(item.createdAt)}</Text>
        </View>
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-800 text-xs font-medium">Volunteer</Text>
        </View>
      </View>

      <View className="bg-white rounded-lg mx-4 shadow-sm border border-gray-200">
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            className="w-full h-48 rounded-t-lg"
            resizeMode="cover"
          />
        )}
        
        <View className="p-4">
          <Text className="text-gray-800 mb-2 text-base">{item.caption}</Text>
          <Text className="text-xl font-bold text-blue-900 mb-2">{item.eventTitle}</Text>
          <Text className="text-gray-600 mb-3">{item.description}</Text>
          
          <View className="bg-gray-50 p-3 rounded-lg mb-3">
            <Text className="text-sm text-gray-700">📅 {item.date} at {item.time}</Text>
            <Text className="text-sm text-gray-700">📍 {item.venue}</Text>
          </View>
          
          {item.categories && item.categories.length > 0 && (
            <View className="flex-row flex-wrap">
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
        </View>
      </View>

      <View className="flex-row justify-between items-center px-4 mt-2">
        <TouchableOpacity 
          onPress={() => handleReaction(item.$id, item.hasUserReacted || false)}
          className="flex-row items-center"
        >
          <Text className={`text-2xl mr-2 ${item.hasUserReacted ? '' : 'opacity-50'}`}>
            {item.hasUserReacted ? '❤️' : '🤍'}
          </Text>
          <Text className="text-gray-600">{item.reactionCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => openCommentModal(item.$id)}
          className="flex-row items-center"
        >
          <Text className="text-2xl mr-2 opacity-70">💬</Text>
          <Text className="text-gray-600">{item.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View className="mb-3 p-3 bg-gray-50 rounded-lg">
      <View className="flex-row items-center mb-1">
        <View className="bg-blue-600 rounded-full w-8 h-8 items-center justify-center mr-2">
          <Text className="text-white font-bold text-xs">
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="font-medium text-gray-900">{item.userName}</Text>
        <Text className="text-gray-500 text-xs ml-2">{getTimeAgo(item.createdAt)}</Text>
      </View>
      <Text className="text-gray-700 ml-10">{item.content}</Text>
    </View>
  );

  if (loading && posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-900 pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-white text-center">Community Feed</Text>
        <Text className="text-center text-blue-200 text-sm mt-1">
          Welcome to our Community!
        </Text>
      </View>

      <FlatList 
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item: CommunityPost) => item.$id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          <View className="px-4 py-8">
            <Text className="text-center text-gray-600 text-lg mb-2">
              No posts available yet
            </Text>
            <Text className="text-center text-gray-500">
              Check back later for volunteer updates!
            </Text>
          </View>
        }
      />

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCommentModal}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-blue-900 pt-12 pb-4 px-4 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-white">Comments</Text>
            <TouchableOpacity onPress={closeCommentModal}>
              <Text className="text-white text-lg">Done</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-4 py-4">
            {loadingComments ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600">Loading comments...</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.$id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View className="py-8">
                    <Text className="text-center text-gray-600">
                      No comments yet. Be the first to comment!
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          <View className="bg-white p-4 border-t border-gray-200">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-3"
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                onPress={submitComment}
                disabled={submittingComment || !newComment.trim()}
                className={`px-4 py-2 rounded-full ${
                  submittingComment || !newComment.trim() 
                    ? 'bg-gray-300' 
                    : 'bg-blue-600'
                }`}
              >
                <Text className={`font-semibold ${
                  submittingComment || !newComment.trim() 
                    ? 'text-gray-500' 
                    : 'text-white'
                }`}>
                  {submittingComment ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}