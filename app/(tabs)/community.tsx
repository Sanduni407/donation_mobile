import { useAuth } from '@/lib/auth';
import {
  Comment,
  CommunityPost,
  addComment,
  addReaction,
  deleteComment,
  getAllCommunityPosts,
  getCommentsByPostId,
  getTimeAgo,
  isVolunteer,
  removeReaction
} from '@/lib/community';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, Heart, MapPin, MessageCircle, Trash2 } from 'lucide-react-native';
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

  const handleDeleteComment = (commentId: string, userName: string) => {
    Alert.alert(
      'Delete Comment',
      `Are you sure you want to delete this comment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId, user.$id);
              
              const updatedComments = await getCommentsByPostId(selectedPostId);
              setComments(updatedComments);
              
              await fetchPosts();
              
              Alert.alert('Success', 'Comment deleted successfully!');
            } catch (error: any) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const renderPostItem = ({ item }: { item: CommunityPost }) => (
    <View className="mb-6 px-4">
      {/* Header with Volunteer Info */}
      <View className="flex-row items-center mb-3">
        <View className="rounded-full w-10 h-10 items-center justify-center mr-3" style={{ backgroundColor: '#0B1E3D' }}>
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

      {/* Post Card - Matching Volunteer Profile Style */}
      <View className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
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
        
        {/* Interaction Buttons */}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <TouchableOpacity 
            onPress={() => handleReaction(item.$id, item.hasUserReacted || false)}
            className="flex-row items-center px-4 py-2 rounded-lg"
            style={{ backgroundColor: item.hasUserReacted ? '#FEE2E2' : '#F3F4F6' }}
          >
            <Heart 
              size={20} 
              color={item.hasUserReacted ? '#DC2626' : '#6B7280'} 
              fill={item.hasUserReacted ? '#DC2626' : 'none'}
            />
            <Text className={`ml-2 font-semibold ${item.hasUserReacted ? 'text-red-600' : 'text-gray-600'}`}>
              {item.reactionCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => openCommentModal(item.$id)}
            className="flex-row items-center px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#E0EEF7' }}
          >
            <MessageCircle size={20} color="#007DBD" />
            <Text className="ml-2 font-semibold" style={{ color: '#007DBD' }}>
              {item.commentCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isOwnComment = item.userId === user.$id;
    
    return (
      <View className="mb-3 p-3 bg-gray-50 rounded-lg">
        <View className="flex-row items-center mb-1">
          <View className="rounded-full w-8 h-8 items-center justify-center mr-2" style={{ backgroundColor: '#007DBD' }}>
            <Text className="text-white font-bold text-xs">
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="font-medium text-gray-900 flex-1">{item.userName}</Text>
          <Text className="text-gray-500 text-xs mr-2">{getTimeAgo(item.createdAt)}</Text>
          
          {isOwnComment && (
            <TouchableOpacity 
              onPress={() => handleDeleteComment(item.$id, item.userName)}
              className="p-1"
            >
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-gray-700 ml-10">{item.content}</Text>
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Compact Elegant Header */}
      <LinearGradient
        colors={['#007DBD', '#005A8C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 20,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        {/* Compact Title with Inline Subtitle */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ 
              width: 4, 
              height: 4, 
              borderRadius: 2, 
              backgroundColor: '#FFB900', 
              marginRight: 10 
            }} />
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: '#FFFFFF', 
              letterSpacing: 1
            }}>
              Community
            </Text>
            <View style={{ 
              width: 4, 
              height: 4, 
              borderRadius: 2, 
              backgroundColor: '#FFB900', 
              marginLeft: 10 
            }} />
          </View>
          <Text style={{ 
            color: '#E0EEF7', 
            fontSize: 13, 
            fontWeight: '500',
            letterSpacing: 0.3
          }}>
            Connect, share, and grow together
          </Text>
        </View>
      </LinearGradient>

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
          <View className="pt-12 pb-4 px-4 flex-row justify-between items-center" style={{ backgroundColor: '#007DBD' }}>
            <Text className="text-xl font-bold text-white">Comments</Text>
            <TouchableOpacity onPress={closeCommentModal}>
              <Text className="text-white text-lg font-semibold">Done</Text>
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
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: submittingComment || !newComment.trim() ? '#D1D5DB' : '#007DBD'
                }}
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