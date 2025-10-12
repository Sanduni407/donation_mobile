import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { createWorkshop, uploadWorkshopImage } from '../../lib/workshops';

export default function CreateWorkshopScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState(user?.name || '');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState('');
  const [capacity, setCapacity] = useState<string>('10');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
  const [requirements, setRequirements] = useState('');
  const [image, setImage] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo permissions to upload workshop image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const file = result.assets ? result.assets[0] : result;
      setImage(file);
    }
  };

  const handleDateConfirm = (selected: Date) => {
    setShowDatePicker(false);
    setDate(selected.toISOString());
  };

  const handleTimeConfirm = (selected: Date) => {
    setShowTimePicker(false);
    setTime(selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSubmit = async () => {
    if (!title || !purpose || !category || !date || !time || !venue) {
      Alert.alert('Validation', 'Please fill required fields (title, purpose, category, date, time, venue).');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | undefined = undefined;
      if (image) {
        const upload = await uploadWorkshopImage(image);
        imageUrl = upload.fileUrl;
      }

      const workshopData = {
        title,
        organizer: organizer || user?.name || 'Admin',
        purpose,
        category,
        date,
        time,
        venue,
        imageUrl,
        targetBeneficiaries,
        duration,
        capacity: Number(capacity),
        requirements,
        adminId: user?.$id,
        adminName: user?.name,
      };

      await createWorkshop(workshopData, user?.prefs?.role || 'admin');

      Alert.alert('Success', 'Workshop created successfully.');
      router.replace('/workshop/my-workshops');
    } catch (error: any) {
      console.error('Create workshop error', error);
      Alert.alert('Error', error?.message || 'Failed to create workshop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-[#007DBD] px-5 pt-6 pb-8 rounded-b-3xl shadow-lg mb-6">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-3xl font-bold text-white">Create Workshop</Text>
                <Text className="text-sm text-white/80 mt-1">
                  Organize learning opportunities
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 pb-6">
            {/* Image Upload */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-3">Workshop Image</Text>
              <TouchableOpacity
                onPress={pickImage}
                className="border-2 border-dashed border-[#007DBD] rounded-xl p-6 items-center"
                activeOpacity={0.7}
              >
                {image ? (
                  <View className="w-full items-center">
                    <Image
                      source={{ uri: image.uri }}
                      className="w-full h-48 rounded-xl mb-3"
                      resizeMode="cover"
                    />
                    <Text className="text-[#007DBD] font-semibold">Change Image</Text>
                  </View>
                ) : (
                  <>
                    <View className="bg-[#E0EEF7] w-16 h-16 rounded-full items-center justify-center mb-3">
                      <Ionicons name="image" size={32} color="#007DBD" />
                    </View>
                    <Text className="text-[#007DBD] font-semibold text-base">Upload Image</Text>
                    <Text className="text-gray-500 text-sm mt-1">Tap to select an image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-4">Basic Information</Text>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Title <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="e.g. Soap Making for Income"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Organizer</Text>
              <TextInput
                value={organizer}
                onChangeText={setOrganizer}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="Organization / person"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Category <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="e.g., Handicraft, PC Basics"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Purpose <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                value={purpose}
                onChangeText={setPurpose}
                multiline
                numberOfLines={4}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 text-base"
                placeholder="Short purpose or summary"
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            {/* Schedule */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-4">Schedule</Text>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Date <Text className="text-red-600">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-[#F5F9FC] rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                    <Text className="text-base ml-2 text-gray-700">
                      {date ? new Date(date).toLocaleDateString() : 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Time <Text className="text-red-600">*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="bg-[#F5F9FC] rounded-xl px-4 py-3 flex-row items-center"
                  >
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text className="text-base ml-2 text-gray-700">
                      {time || 'Select time'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Duration</Text>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 text-base"
                placeholder="e.g. 2 hours"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Location & Capacity */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-4">Location & Capacity</Text>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Venue <Text className="text-red-600">*</Text>
              </Text>
              <TextInput
                value={venue}
                onChangeText={setVenue}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="Address or hall"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Capacity</Text>
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 text-base"
                placeholder="Number of participants"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Additional Details */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-4">Additional Details</Text>

              <Text className="text-sm font-semibold text-gray-700 mb-2">Target Beneficiaries</Text>
              <TextInput
                value={targetBeneficiaries}
                onChangeText={setTargetBeneficiaries}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="e.g. Women, Youth"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Requirements</Text>
              <TextInput
                value={requirements}
                onChangeText={setRequirements}
                multiline
                numberOfLines={3}
                className="bg-[#F5F9FC] rounded-xl px-4 py-3 text-base"
                placeholder="Materials participants should bring"
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`py-4 rounded-xl shadow-lg mb-4 ${submitting ? 'bg-gray-400' : 'bg-[#FFB900]'}`}
              activeOpacity={0.8}
            >
              <Text className="text-center text-[#007DBD] text-lg font-bold">
                {submitting ? 'Creating Workshop...' : 'Create Workshop'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setShowDatePicker(false)}
        />

        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}