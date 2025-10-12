import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateBeneficiaryPostImage, uploadPostImage } from '../../../lib/admin';

const COLORS = {
  lightBlue: '#E0EEF7',
  darkBlue: '#007DBD',
  accentYellow: '#FFB900',
  white: '#FFFFFF',
  background: '#F5F9FC',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  border: '#D1E0F0',
};

export default function AddImageScreen() {
  const { postId } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

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
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

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

      const { fileUrl } = await uploadPostImage(selectedImage);
      console.log('Image uploaded, updating post...');

      await updateBeneficiaryPostImage(postId as string, fileUrl);
      console.log('Post updated successfully');

      Alert.alert('Success', 'Image uploaded successfully! Post is now live.', [
        {
          text: 'OK',
          onPress: () => router.push('/admin/help-requests'),
        },
      ]);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', `Failed to upload image: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.darkBlue, marginBottom: 8 }}>
            Add Post Image
          </Text>
          <View style={{ height: 4, width: 50, backgroundColor: COLORS.accentYellow, borderRadius: 2 }} />
        </View>

        {/* Image Preview */}
        {selectedImage ? (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>
              Preview
            </Text>
            <View
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Image
                source={{ uri: selectedImage.uri }}
                style={{ width: '100%', height: 200, resizeMode: 'cover' }}
              />
            </View>
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={{ marginTop: 12, padding: 8 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.error }}>
                Clear Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
              marginBottom: 28,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="image-outline" size={56} color={COLORS.darkBlue} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 12, textAlign: 'center' }}>
              No image selected
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' }}>
              Choose or capture an image to get started
            </Text>
          </View>
        )}

        {/* Image Selection Buttons */}
        <View style={{ gap: 10, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              flexDirection: 'row',
              backgroundColor: COLORS.lightBlue,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={20} color={COLORS.darkBlue} />
            <Text style={{ color: COLORS.darkBlue, fontSize: 15, fontWeight: '600', marginLeft: 10 }}>
              Choose from Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            style={{
              flexDirection: 'row',
              backgroundColor: '#D1FAE5',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={COLORS.success} />
            <Text style={{ color: COLORS.success, fontSize: 15, fontWeight: '600', marginLeft: 10 }}>
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        {selectedImage && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={uploading}
            style={{
              backgroundColor: uploading ? COLORS.textSecondary : COLORS.darkBlue,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploading ? 0.6 : 1,
              flexDirection: 'row',
              marginBottom: 24,
              shadowColor: COLORS.darkBlue,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.8}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700', marginLeft: 10 }}>
                  Uploading...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.white} />
                <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700', marginLeft: 10 }}>
                  Upload & Publish
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Instructions */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: COLORS.accentYellow,
            marginTop: 'auto',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.accentYellow} />
            <Text
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                marginLeft: 12,
                flex: 1,
                lineHeight: 20,
              }}
            >
              Select a high-quality image (16:9 aspect ratio recommended) for the best results. This image will be displayed on the beneficiary post.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}