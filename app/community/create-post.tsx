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
  isVolunteer,
  updateCommunityPost,
  uploadCommunityPostImage
} from '../../lib/community';

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
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExistingPost, setLoadingExistingPost] = useState(false);

  const userIsVolunteer = user?.prefs ? isVolunteer(user.prefs) : false;

  useEffect(() => {
    if (user && !userIsVolunteer) {
      Alert.alert(
        'Access Restricted', 
        'Only volunteers can create or edit community posts.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
  }, [user, userIsVolunteer]);

  useEffect(() => {
    if (isEditing && params.postId && userIsVolunteer) {
      loadExistingPost(params.postId as string);
    }
  }, [isEditing, params.postId, userIsVolunteer]);

  const parseFormattedDate = (dateStr: string): Date => {
    console.log('Parsing date string:', dateStr);
    
    // Handle various date formats
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Try to match format like "September 30, 2025" or "September 30 2025"
    const datePattern = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/;
    const match = dateStr.match(datePattern);
    
    if (match) {
      const monthName = match[1];
      const day = parseInt(match[2]);
      const year = parseInt(match[3]);
      
      const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
      
      if (monthIndex !== -1) {
        const parsed = new Date(year, monthIndex, day);
        console.log('Successfully parsed date:', parsed);
        return parsed;
      }
    }
    
    // Fallback: try standard Date parsing
    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      console.log('Fallback date parsing succeeded:', fallback);
      return fallback;
    }
    
    console.log('Date parsing failed, returning current date');
    return new Date();
  };

  const parseFormattedTime = (timeStr: string): Date => {
    console.log('Parsing time string:', timeStr);
    
    const timeDate = new Date();
    
    // Match format like "02:30 PM" or "2:30 PM"
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = timeStr.match(timePattern);
    
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      timeDate.setHours(hours, minutes, 0, 0);
      console.log('Successfully parsed time:', timeDate);
      return timeDate;
    }
    
    console.log('Time parsing failed, returning current time');
    return timeDate;
  };

  const loadExistingPost = async (postId: string) => {
    try {
      setLoadingExistingPost(true);
      const post = await getCommunityPostById(postId);

      console.log('Loaded post:', post);

      if (post.volunteerId !== user.$id) {
        Alert.alert('Error', 'You can only edit your own posts', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      setCaption(post.caption || '');
      setEventTitle(post.eventTitle || '');
      setDescription(post.description || '');
      setExistingImageUrl(post.imageUrl || '');
      setVenue(post.venue || '');
      
      // Parse date and time
      if (post.date) {
        const parsedDate = parseFormattedDate(post.date);
        setDate(parsedDate);
      }
      
      if (post.time) {
        const parsedTime = parseFormattedTime(post.time);
        setTime(parsedTime);
      }
      
      const postCategories = post.categories || [];
      setCategories({
        food: postCategories.includes('food'),
        stationery: postCategories.includes('stationery'),
        clothing: postCategories.includes('clothing'),
        household: postCategories.includes('household'),
      });
    } catch (error) {
      console.error('Error loading existing post:', error);
      Alert.alert('Error', 'Failed to load post data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
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

      if (selectedImage) {
        const uploadResult = await uploadCommunityPostImage(selectedImage);
        imageUrl = uploadResult.fileUrl;
      }

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

      const userRole = user.prefs?.role || '';

      if (isEditing) {
        await updateCommunityPost(params.postId as string, postData, userRole, user.$id);
        Alert.alert('Success', 'Post updated successfully!');
      } else {
        await createCommunityPost(postData, userRole);
        Alert.alert('Success', 'Post created successfully!');
      }

      router.back();
    } catch (error: any) {
      console.error('Error submitting post:', error);
      Alert.alert('Error', error.message || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user && !userIsVolunteer) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-6xl mb-4">🚫</Text>
        <Text className="text-xl font-bold text-gray-800 text-center mb-2">
          Access Restricted
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Only volunteers can create or edit community posts.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {/* Modified Header - Changed to dark blue (#007DBD) */}
        <View className="rounded-lg p-4 mb-4 shadow-sm" style={{ backgroundColor: '#007DBD' }}>
          <Text className="text-2xl font-bold text-center text-white">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </Text>
          <View className="flex-row items-center justify-center mt-2">
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-800 text-xs font-medium">Volunteer Only</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-blue-900 mb-2">Caption</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter a caption for your post..."
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />

          <Text className="text-lg font-semibold text-blue-900 mb-2">Event Title</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event title..."
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          <Text className="text-lg font-semibold text-blue-900 mb-2">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

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

          <Text className="text-lg font-semibold text-blue-900 mb-2">Venue</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-700"
            placeholder="Enter event venue..."
            value={venue}
            onChangeText={setVenue}
          />

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

          {/* Modified Submit Button - Changed to dark blue (#007DBD) */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-lg p-4 ${
              loading ? 'bg-gray-400' : ''
            }`}
            style={!loading ? { backgroundColor: '#007DBD' } : {}}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Post' : 'Create Post')
              }
            </Text>
          </TouchableOpacity>

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