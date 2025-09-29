import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { updateBeneficiaryPostImage, uploadPostImage } from '../../../lib/admin';

export default function AddImageScreen() {
  const { postId } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setUploading(true);
      console.log('Starting image upload process...');
      console.log('Selected image:', selectedImage);

      // Upload image to the same bucket as evidence files (with different naming)
      const { fileUrl } = await uploadPostImage(selectedImage);
      console.log('Image uploaded, updating post...');

      // Update post with image URL
      await updateBeneficiaryPostImage(postId as string, fileUrl);
      console.log('Post updated successfully');

      Alert.alert(
        'Success', 
        'Image uploaded successfully! Post is now live.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/admin/help-requests')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to upload image: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Add Post Image</Text>

      {/* Image Preview */}
      {selectedImage && (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Selected Image:</Text>
          <Image
            source={{ uri: selectedImage.uri }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
        </View>
      )}

      {/* Image Selection Buttons */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={pickImage}
          className="bg-blue-500 p-4 rounded-lg mb-3"
        >
          <Text className="text-white text-center font-semibold">
            Choose from Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          className="bg-green-500 p-4 rounded-lg mb-3"
        >
          <Text className="text-white text-center font-semibold">
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      {selectedImage && (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={uploading}
          className={`p-4 rounded-lg ${uploading ? 'bg-gray-400' : 'bg-purple-500'}`}
        >
          <Text className="text-white text-center font-semibold">
            {uploading ? 'Uploading to same bucket...' : 'Submit Post'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Instructions */}
      <View className="mt-6 p-4 bg-gray-100 rounded-lg">
        <Text className="text-gray-700 text-center">
          Select an image for this beneficiary post. This will be stored in the same bucket as evidence files but with different naming (post_image_).
        </Text>
      </View>
    </View>
  );
}

