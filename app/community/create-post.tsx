import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../lib/auth';
import {
    CommunityPostData,
    createCommunityPost,
    getCommunityPostById,
    updateCommunityPost,
    uploadCommunityPostImage
} from '../../lib/community';

// Type for selected image
interface SelectedImageType {
  uri: string;
  width: number;
  height: number;
  type?: string;
  mimeType?: string;
  fileSize?: number;
  size?: number;
}

export default function CreatePostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.postId;

  // Form state
  const [caption, setCaption] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedImageType | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [venue, setVenue] = useState('');
  const [categories, setCategories] = useState({
    food: false,
    stationery: false,
    clothing: false,
    household: false,
  });
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExistingPost, setLoadingExistingPost] = useState(false);

  // Load existing post data if editing
  useEffect(() => {
    if (isEditing && params.postId) {
      loadExistingPost(params.postId as string);
    }
  }, [isEditing, params.postId]);

  const loadExistingPost = async (postId: string) => {
    try {
      setLoadingExistingPost(true);
      const post = await getCommunityPostById(postId);

      // Populate form with existing data
      setCaption(post.caption || '');
      setEventTitle(post.eventTitle || '');
      setDescription(post.description || '');
      setExistingImageUrl(post.imageUrl || '');
      setDate(new Date(post.date || new Date()));
      setTime(new Date(`2000-01-01 ${post.time || '00:00'}`));
      setVenue(post.venue || '');
      
      // Set categories
      const postCategories = post.categories || [];
      setCategories({
        food: postCategories.includes('food'),
        stationery: postCategories.includes('stationery'),
        clothing: postCategories.includes('clothing'),
        household: postCategories.includes('household'),
      });
    } catch (error) {
      console.error('Error loading existing post:', error);
      Alert.alert('Error', 'Failed to load post data');
    } finally {
      setLoadingExistingPost(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const toggleCategory = (category: string) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev]
    }));
  };

  const getSelectedCategories = (): string[] => {
    return Object.entries(categories)
      .filter(([_, selected]) => selected)
      .map(([category, _]) => category);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const validateForm = (): boolean => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please enter a caption');
      return false;
    }
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!venue.trim()) {
      Alert.alert('Error', 'Please enter a venue');
      return false;
    }
    if (getSelectedCategories().length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = existingImageUrl;

      // Upload new image if selected
      if (selectedImage) {
        const uploadResult = await uploadCommunityPostImage(selectedImage);
        imageUrl = uploadResult.fileUrl;
      }

      // Prepare post data
      const postData: CommunityPostData = {
        volunteerId: user.$id,
        volunteerName: user.name,
        caption: caption.trim(),
        eventTitle: eventTitle.trim(),
        description: description.trim(),
        imageUrl,
        date: formatDate(date),
        time: formatTime(time),
        venue: venue.trim(),
        categories: getSelectedCategories(),
      };

      if (isEditing) {
        await updateCommunityPost(params.postId as string, postData);
        Alert.alert('Success', 'Post updated successfully!');
      } else {
        await createCommunityPost(postData);
        Alert.alert('Success', 'Post created successfully!');
      }

      router.back();
    } catch (error) {
      console.error('Error submitting post:', error);
      Alert.alert('Error', 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingExistingPost) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading post data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="bg-blue-900 rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-center text-white">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          {/* Caption */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Caption</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter a caption for your post..."
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />

          {/* Event Title */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Event Title</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event title..."
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          {/* Description */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Image Upload */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Event Image</Text>
          <TouchableOpacity 
            onPress={pickImage}
            className="border border-dashed border-gray-400 rounded-lg p-4 mb-4 items-center"
          >
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage.uri }} 
                className="w-full h-48 rounded-lg mb-2"
                resizeMode="cover"
              />
            ) : existingImageUrl ? (
              <Image 
                source={{ uri: existingImageUrl }} 
                className="w-full h-48 rounded-lg mb-2"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center py-8">
                <Text className="text-6xl mb-2">📷</Text>
                <Text className="text-gray-600">Tap to select image</Text>
              </View>
            )}
            <Text className="text-blue-600 font-medium">
              {selectedImage || existingImageUrl ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>

          {/* Date Selection */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Event Date</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg p-3 mb-4"
          >
            <Text className="text-gray-700">{formatDate(date)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          {/* Time Selection */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Event Time</Text>
          <TouchableOpacity 
            onPress={() => setShowTimePicker(true)}
            className="border border-gray-300 rounded-lg p-3 mb-4"
          >
            <Text className="text-gray-700">{formatTime(time)}</Text>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}

          {/* Venue */}
          <Text className="text-lg font-semibold text-blue-900 mb-2">Venue</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event venue..."
            value={venue}
            onChangeText={setVenue}
          />

          {/* Categories */}
          <Text className="text-lg font-semibold text-blue-900 mb-3">Categories</Text>
          <View className="flex-row flex-wrap mb-6">
            {Object.entries(categories).map(([category, selected]) => (
              <TouchableOpacity
                key={category}
                onPress={() => toggleCategory(category)}
                className={`mr-3 mb-2 px-4 py-2 rounded-full border ${
                  selected 
                    ? 'bg-yellow-500 border-yellow-500' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text className={`capitalize ${
                  selected ? 'text-white' : 'text-gray-700'
                }`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-lg p-4 ${
              loading ? 'bg-gray-400' : 'bg-blue-900'
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Post' : 'Create Post')
              }
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="border border-red-500 rounded-lg p-4 mt-3"
          >
            <Text className="text-red-500 text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}