// app/workshop/create.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '../../lib/auth';
import { createWorkshop, uploadWorkshopImage } from '../../lib/workshops';

export default function CreateWorkshopScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // form state
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

  // date/time pickers
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

    // ✅ updated for new expo-image-picker API
    if (!result.canceled) {
      // assets[0] contains {uri, width, height, ...}
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
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Create Workshop</Text>

      <Text className="font-semibold">Title *</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        className="border p-2 rounded mb-3"
        placeholder="e.g. Soap Making for Income"
      />

      <Text className="font-semibold">Organizer</Text>
      <TextInput
        value={organizer}
        onChangeText={setOrganizer}
        className="border p-2 rounded mb-3"
        placeholder="Organization / person"
      />

      <Text className="font-semibold">Purpose *</Text>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        multiline
        numberOfLines={3}
        className="border p-2 rounded mb-3"
        placeholder="Short purpose or summary"
      />

      <Text className="font-semibold">Category *</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        className="border p-2 rounded mb-3"
        placeholder="e.g., Handicraft, PC Basics"
      />

      <View className="flex-row space-x-3 mb-3">
        <View style={{ flex: 1 }}>
          <Text className="font-semibold">Date *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} className="border p-2 rounded">
            <Text>{date ? new Date(date).toLocaleDateString() : 'Select date'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text className="font-semibold">Time *</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} className="border p-2 rounded">
            <Text>{time || 'Select time'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="font-semibold">Duration</Text>
      <TextInput
        value={duration}
        onChangeText={setDuration}
        className="border p-2 rounded mb-3"
        placeholder="e.g. 2 hours"
      />

      <Text className="font-semibold">Venue *</Text>
      <TextInput
        value={venue}
        onChangeText={setVenue}
        className="border p-2 rounded mb-3"
        placeholder="Address or hall"
      />

      <Text className="font-semibold">Capacity</Text>
      <TextInput
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
        className="border p-2 rounded mb-3"
        placeholder="Number of participants"
      />

      <Text className="font-semibold">Target Beneficiaries</Text>
      <TextInput
        value={targetBeneficiaries}
        onChangeText={setTargetBeneficiaries}
        className="border p-2 rounded mb-3"
        placeholder="e.g. Women, Youth"
      />

      <Text className="font-semibold">Requirements</Text>
      <TextInput
        value={requirements}
        onChangeText={setRequirements}
        multiline
        numberOfLines={3}
        className="border p-2 rounded mb-3"
        placeholder="Materials participants should bring"
      />

      <Text className="font-semibold mb-2">Image</Text>
      <View className="mb-3">
        <TouchableOpacity onPress={pickImage} className="p-3 rounded border flex-row items-center justify-center">
          <Ionicons name="image-outline" size={18} style={{ marginRight: 8 }} />
          <Text>{image ? 'Change Image' : 'Pick an image'}</Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image.uri || image }}
            style={{ width: 140, height: 100, marginTop: 8, borderRadius: 6 }}
          />
        )}
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={submitting} className="mb-8">
        <LinearGradient colors={['#fbbf24', '#f59e0b']} style={{ padding: 14, borderRadius: 8 }}>
          <Text className="text-center font-semibold">{submitting ? 'Saving...' : 'Create Workshop'}</Text>
        </LinearGradient>
      </TouchableOpacity>

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
    </ScrollView>
  );
}
