import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
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
import { translateText } from '@/lib/translationService';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, Filter, Heart, MapPin, MessageCircle, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface TranslatedPost {
  [key: string]: string;
}

// Extracted PostItem as a separate component to properly use hooks
const PostItem = ({ 
  item, 
  language, 
  translatedPosts, 
  getTranslatedText, 
  handleReaction, 
  openCommentModal 
}: { 
  item: CommunityPost; 
  language: string;
  translatedPosts: { [key: string]: TranslatedPost };
  getTranslatedText: (text: string, cacheKey: string) => Promise<string>;
  handleReaction: (postId: string, hasUserReacted: boolean) => Promise<void>;
  openCommentModal: (postId: string) => Promise<void>;
}) => {
  const [translatedCaption, setTranslatedCaption] = useState(item.caption);
  const [translatedTitle, setTranslatedTitle] = useState(item.eventTitle);
  const [translatedDescription, setTranslatedDescription] = useState(item.description);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const translateContent = async () => {
      if (language !== 'en') {
        setTranslating(true);
        try {
          const caption = await getTranslatedText(item.caption, `caption-${item.$id}`);
          const title = await getTranslatedText(item.eventTitle, `title-${item.$id}`);
          const desc = await getTranslatedText(item.description, `desc-${item.$id}`);
          
          setTranslatedCaption(caption);
          setTranslatedTitle(title);
          setTranslatedDescription(desc);
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslating(false);
        }
      } else {
        setTranslatedCaption(item.caption);
        setTranslatedTitle(item.eventTitle);
        setTranslatedDescription(item.description);
      }
    };
    translateContent();
  }, [language, item]);

  return (
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
        
        <Text className="text-gray-700 mb-2 text-sm font-medium" numberOfLines={2}>
          {translating ? '...' : translatedCaption}
        </Text>
        <Text className="text-lg font-bold mb-2" style={{ color: '#007DBD' }} numberOfLines={1}>
          {translating ? '...' : translatedTitle}
        </Text>
        <Text className="text-gray-600 mb-3 text-sm" numberOfLines={3}>
          {translating ? '...' : translatedDescription}
        </Text>
        
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
};

// Extracted CommentItem as a separate component to properly use hooks
const CommentItem = ({ 
  item, 
  language, 
  getTranslatedComment, 
  userId, 
  handleDeleteComment 
}: { 
  item: Comment; 
  language: string;
  getTranslatedComment: (text: string, cacheKey: string) => Promise<string>;
  userId: string;
  handleDeleteComment: (commentId: string, userName: string) => void;
}) => {
  const [translatedContent, setTranslatedContent] = useState(item.content);
  const [translating, setTranslating] = useState(false);
  const isOwnComment = item.userId === userId;
  
  useEffect(() => {
    const translateComment = async () => {
      if (language !== 'en') {
        setTranslating(true);
        try {
          const translated = await getTranslatedComment(item.content, `comment-${item.$id}`);
          setTranslatedContent(translated);
        } catch (error) {
          console.error('Comment translation error:', error);
        } finally {
          setTranslating(false);
        }
      } else {
        setTranslatedContent(item.content);
      }
    };
    translateComment();
  }, [language, item]);

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
      <Text className="text-gray-700 ml-10">
        {translating ? '...' : translatedContent}
      </Text>
    </View>
  );
};

export default function CommunityFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Translation state
  const [translatedPosts, setTranslatedPosts] = useState<{ [key: string]: TranslatedPost }>({});
  const [translatingInProgress, setTranslatingInProgress] = useState(false);
  const [translatedComments, setTranslatedComments] = useState<{ [key: string]: string }>({});

  const userIsVolunteer = user?.prefs ? isVolunteer(user.prefs) : false;

  // Clear translation cache when language changes
  useEffect(() => {
    setTranslatedPosts({});
    setTranslatedComments({});
  }, [language]);

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

  // Filter posts based on selected category
  const getFilteredPosts = () => {
    if (selectedFilter === 'all') {
      return posts;
    }
    return posts.filter(post => 
      post.categories && post.categories.includes(selectedFilter)
    );
  };

  // Translation helper function
  const getTranslatedText = async (text: string, cacheKey: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    
    if (translatedPosts[cacheKey]?.[language]) {
      return translatedPosts[cacheKey][language];
    }

    try {
      const translated = await translateText({ text, targetLanguage: language });
      setTranslatedPosts(prev => ({
        ...prev,
        [cacheKey]: {
          ...(prev[cacheKey] || {}),
          [language]: translated
        }
      }));
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  // Translate comment text
  const getTranslatedComment = async (text: string, cacheKey: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    
    const fullKey = `${language}-${cacheKey}`;
    if (translatedComments[fullKey]) {
      return translatedComments[fullKey];
    }

    try {
      const translated = await translateText({ text, targetLanguage: language });
      setTranslatedComments(prev => ({
        ...prev,
        [fullKey]: translated
      }));
      return translated;
    } catch (error) {
      console.error('Comment translation failed:', error);
      return text;
    }
  };

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

  const renderPostItem = ({ item }: { item: CommunityPost }) => {
    return (
      <PostItem
        item={item}
        language={language}
        translatedPosts={translatedPosts}
        getTranslatedText={getTranslatedText}
        handleReaction={handleReaction}
        openCommentModal={openCommentModal}
      />
    );
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    return (
      <CommentItem
        item={item}
        language={language}
        getTranslatedComment={getTranslatedComment}
        userId={user.$id}
        handleDeleteComment={handleDeleteComment}
      />
    );
  };

  const filteredPosts = getFilteredPosts();

  if (loading && posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Compact Elegant Header - WITHOUT Language Selector */}
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
        {/* Header with Title Only */}
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

      {/* Filter Section with Language Selector */}
      <View className="px-4 py-3 bg-white" style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <View className="flex-row items-center justify-between">
          {/* Filter Button */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(true)}
              className="flex-row items-center px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#E0EEF7' }}
            >
              <Filter size={18} color="#007DBD" />
              <Text className="ml-2 font-semibold" style={{ color: '#007DBD' }}>
                Filter
              </Text>
            </TouchableOpacity>

            {selectedFilter !== 'all' && (
              <View className="flex-row items-center ml-3">
                <View className="px-3 py-2 rounded-lg mr-2" style={{ backgroundColor: '#FFB900' }}>
                  <Text className="text-xs font-bold text-black">
                    {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedFilter('all')}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <X size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Language Selector in Right Corner */}
          <View>
            <LanguageSelector />
          </View>
        </View>
      </View>

      <FlatList 
        data={filteredPosts}
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
              {selectedFilter !== 'all' 
                ? `No posts found in "${selectedFilter}" category` 
                : 'No posts available yet'}
            </Text>
            <Text className="text-center text-gray-500">
              {selectedFilter !== 'all'
                ? 'Try a different filter or clear the current filter'
                : 'Check back later for volunteer updates!'}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '70%' }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E0EEF7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Filter size={20} color="#007DBD" />
                </View>
                <Text className="text-2xl font-bold" style={{ color: '#007DBD' }}>
                  Filter Posts
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All Posts */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('all');
                  setFilterModalVisible(false);
                }}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ 
                  backgroundColor: selectedFilter === 'all' ? '#E0EEF7' : '#F9FAFB',
                  borderWidth: selectedFilter === 'all' ? 2 : 1,
                  borderColor: selectedFilter === 'all' ? '#007DBD' : '#E5E7EB'
                }}
              >
                <View className="flex-row items-center">
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: selectedFilter === 'all' ? '#007DBD' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text className="text-lg">{selectedFilter === 'all' ? '✓' : '🌐'}</Text>
                  </View>
                  <View>
                    <Text className="text-base font-bold" style={{ color: '#000000' }}>
                      All Posts
                    </Text>
                    <Text className="text-xs text-gray-500">Show all community posts</Text>
                  </View>
                </View>
                {selectedFilter === 'all' && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#007DBD',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text className="text-white font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Food */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('food');
                  setFilterModalVisible(false);
                }}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ 
                  backgroundColor: selectedFilter === 'food' ? '#FFF7ED' : '#F9FAFB',
                  borderWidth: selectedFilter === 'food' ? 2 : 1,
                  borderColor: selectedFilter === 'food' ? '#FFB900' : '#E5E7EB'
                }}
              >
                <View className="flex-row items-center">
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: selectedFilter === 'food' ? '#FFB900' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text className="text-lg">🍽️</Text>
                  </View>
                  <View>
                    <Text className="text-base font-bold" style={{ color: '#000000' }}>
                      Food
                    </Text>
                    <Text className="text-xs text-gray-500">Food drives & donations</Text>
                  </View>
                </View>
                {selectedFilter === 'food' && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFB900',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text className="text-black font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Stationery */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('stationery');
                  setFilterModalVisible(false);
                }}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ 
                  backgroundColor: selectedFilter === 'stationery' ? '#E0EEF7' : '#F9FAFB',
                  borderWidth: selectedFilter === 'stationery' ? 2 : 1,
                  borderColor: selectedFilter === 'stationery' ? '#007DBD' : '#E5E7EB'
                }}
              >
                <View className="flex-row items-center">
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: selectedFilter === 'stationery' ? '#007DBD' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text className="text-lg">✏️</Text>
                  </View>
                  <View>
                    <Text className="text-base font-bold" style={{ color: '#000000' }}>
                      Stationery
                    </Text>
                    <Text className="text-xs text-gray-500">School supplies & books</Text>
                  </View>
                </View>
                {selectedFilter === 'stationery' && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#007DBD',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text className="text-white font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Clothing */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('clothing');
                  setFilterModalVisible(false);
                }}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ 
                  backgroundColor: selectedFilter === 'clothing' ? '#FFF7ED' : '#F9FAFB',
                  borderWidth: selectedFilter === 'clothing' ? 2 : 1,
                  borderColor: selectedFilter === 'clothing' ? '#FFB900' : '#E5E7EB'
                }}
              >
                <View className="flex-row items-center">
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: selectedFilter === 'clothing' ? '#FFB900' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text className="text-lg">👕</Text>
                  </View>
                  <View>
                    <Text className="text-base font-bold" style={{ color: '#000000' }}>
                      Clothing
                    </Text>
                    <Text className="text-xs text-gray-500">Clothes & accessories</Text>
                  </View>
                </View>
                {selectedFilter === 'clothing' && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFB900',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text className="text-black font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Household */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('household');
                  setFilterModalVisible(false);
                }}
                className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                style={{ 
                  backgroundColor: selectedFilter === 'household' ? '#E0EEF7' : '#F9FAFB',
                  borderWidth: selectedFilter === 'household' ? 2 : 1,
                  borderColor: selectedFilter === 'household' ? '#007DBD' : '#E5E7EB'
                }}
              >
                <View className="flex-row items-center">
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: selectedFilter === 'household' ? '#007DBD' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text className="text-lg">🏠</Text>
                  </View>
                  <View>
                    <Text className="text-base font-bold" style={{ color: '#000000' }}>
                      Household
                    </Text>
                    <Text className="text-xs text-gray-500">Home essentials & furniture</Text>
                  </View>
                </View>
                {selectedFilter === 'household' && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#007DBD',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text className="text-white font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Clear Filter Button */}
            {selectedFilter !== 'all' && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('all');
                  setFilterModalVisible(false);
                }}
                className="mt-4 p-4 rounded-xl items-center"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <Text className="font-bold" style={{ color: '#DC2626' }}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
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