// components/PreferencesModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type PreferencesModalProps = {
  visible: boolean;
  onClose: () => void;
  initialPreferences: string[];
  onSave: (preferences: string[]) => Promise<void>;
};

export default function PreferencesModal({
  visible,
  onClose,
  initialPreferences,
  onSave,
}: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<string[]>(initialPreferences);
  const [inputText, setInputText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddPreference = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (preferences.includes(trimmed)) {
      Alert.alert('Duplicate', 'This preference already exists');
      return;
    }

    if (preferences.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 preferences');
      return;
    }

    setPreferences([...preferences, trimmed]);
    setInputText('');
  };

  const handleRemovePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (preferences.length === 0) {
      Alert.alert('Empty Preferences', 'Please add at least one preference');
      return;
    }

    setSaving(true);
    try {
      await onSave(preferences);
      Alert.alert('Success', 'Your donation preferences have been saved!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // Suggested preferences for quick add
  const suggestions = [
    'Education',
    'Healthcare',
    'Food & Nutrition',
    'Shelter',
    'Emergency Relief',
    'Children',
    'Elderly Care',
    'Disaster Relief',
  ];

  const handleAddSuggestion = (suggestion: string) => {
    if (!preferences.includes(suggestion) && preferences.length < 10) {
      setPreferences([...preferences, suggestion]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-4/5">
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <Text className="text-2xl font-bold text-[#007DBD]">
              Donation Preferences
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 py-4">
            {/* Description */}
            <Text className="text-sm text-gray-600 mb-4 leading-5">
              Set your donation preferences to receive personalized recommendations.
              Add causes or categories you care about most.
            </Text>

            {/* Input Section */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-[#007DBD] mb-2">
                Add New Preference
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="e.g., Education, Healthcare"
                  className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-base"
                  onSubmitEditing={handleAddPreference}
                  maxLength={30}
                />
                <TouchableOpacity
                  onPress={handleAddPreference}
                  className="bg-[#007DBD] p-3 rounded-xl"
                  disabled={!inputText.trim()}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Suggestions */}
            {preferences.length < 10 && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-[#007DBD] mb-3">
                  Quick Add Suggestions
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {suggestions
                    .filter((s) => !preferences.includes(s))
                    .map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => handleAddSuggestion(suggestion)}
                        className="bg-[#E0EEF7] px-4 py-2 rounded-full flex-row items-center"
                      >
                        <Ionicons name="add-circle-outline" size={16} color="#007DBD" />
                        <Text className="text-[#007DBD] ml-1 text-sm font-medium">
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {/* Current Preferences */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-[#007DBD] mb-3">
                Your Preferences ({preferences.length}/10)
              </Text>
              {preferences.length === 0 ? (
                <View className="bg-gray-50 p-6 rounded-xl items-center">
                  <Ionicons name="heart-dislike-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2 text-center">
                    No preferences added yet. Add your first preference above!
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {preferences.map((pref, index) => (
                    <View
                      key={index}
                      className="bg-[#007DBD] px-4 py-2 rounded-full flex-row items-center"
                    >
                      <Text className="text-white text-sm font-medium mr-2">
                        {pref}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemovePreference(index)}>
                        <Ionicons name="close-circle" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="p-5 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || preferences.length === 0}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                saving || preferences.length === 0 ? 'bg-gray-300' : 'bg-[#FFB900]'
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#007DBD" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={24} color="#007DBD" />
                  <Text className="text-[#007DBD] text-lg font-bold ml-2">
                    Save Preferences
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}