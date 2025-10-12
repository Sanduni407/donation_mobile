import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { getWorkshopRegistrations } from '../../lib/registrations';
import { getWorkshopById, Workshop } from '../../lib/workshops';

export default function WorkshopDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWorkshopDetails = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const workshopData = await getWorkshopById(id as string);
      setWorkshop(workshopData);

      const registrations = await getWorkshopRegistrations(id as string);
      setRegistrationCount(registrations.length);
    } catch (error) {
      console.error('Error fetching workshop details:', error);
      Alert.alert('Error', 'Failed to load workshop details');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkshopDetails();
    }, [id])
  );

  const handleRegister = () => {
    if (!workshop) return;

    if (registrationCount >= workshop.capacity) {
      Alert.alert('Workshop Full', 'This workshop has reached its capacity.');
      return;
    }

    router.push(`/workshop/register?workshopId=${workshop.$id}&workshopTitle=${encodeURIComponent(workshop.title)}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="mt-3 text-base text-[#007DBD] font-medium">
            Loading details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workshop) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-white w-32 h-32 rounded-full items-center justify-center mb-4 shadow-lg">
            <Ionicons name="alert-circle-outline" size={60} color="#E0EEF7" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">Workshop Not Found</Text>
          <Text className="text-gray-500 text-center mb-6">
            This workshop may have been removed or doesn't exist
          </Text>
          <TouchableOpacity
            className="bg-[#007DBD] px-8 py-3 rounded-xl shadow-md"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = registrationCount >= workshop.capacity;
  const progressPercentage = (registrationCount / workshop.capacity) * 100;
  const spotsLeft = workshop.capacity - registrationCount;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {workshop.imageUrl ? (
          <Image source={{ uri: workshop.imageUrl }} className="w-full h-80" resizeMode="cover" />
        ) : (
          <View className="w-full h-80 bg-gradient-to-br from-[#E0EEF7] to-[#B8D9ED] items-center justify-center">
            <Ionicons name="images" size={80} color="#007DBD" />
          </View>
        )}

        {/* Back Button Overlay */}
        <TouchableOpacity
          className="absolute top-4 left-4 bg-white/90 w-10 h-10 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#007DBD" />
        </TouchableOpacity>

        {/* Content */}
        <View className="px-5 py-6">
          {/* Category Badge */}
          <View className="flex-row items-center mb-3">
            <View className="bg-[#FFF3CD] px-4 py-2 rounded-full shadow-sm">
              <Text className="text-[#FFB900] font-bold text-sm">{workshop.category}</Text>
            </View>
            {isFull && (
              <View className="bg-red-100 px-4 py-2 rounded-full ml-2 shadow-sm">
                <Text className="text-red-600 font-bold text-sm">FULL</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 mb-4">{workshop.title}</Text>

          {/* Info Cards */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            {/* Organizer */}
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="bg-[#E0EEF7] w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#007DBD" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Organized by</Text>
                <Text className="text-base font-semibold text-gray-800">{workshop.organizer}</Text>
              </View>
            </View>

            {/* Date & Time */}
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="bg-[#E0EEF7] w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#007DBD" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Date & Time</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {new Date(workshop.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">{workshop.time}</Text>
              </View>
            </View>

            {/* Duration */}
            {workshop.duration && (
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-[#E0EEF7] w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="time" size={20} color="#007DBD" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Duration</Text>
                  <Text className="text-base font-semibold text-gray-800">{workshop.duration}</Text>
                </View>
              </View>
            )}

            {/* Location */}
            <View className="flex-row items-center py-3">
              <View className="bg-[#E0EEF7] w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#007DBD" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Venue</Text>
                <Text className="text-base font-semibold text-gray-800">{workshop.venue}</Text>
              </View>
            </View>
          </View>

          {/* Registration Status */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Registration Status</Text>
              <View className="flex-row items-center">
                <Ionicons name="people" size={18} color="#007DBD" />
                <Text className="text-base font-bold text-[#007DBD] ml-2">
                  {registrationCount} / {workshop.capacity}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-gray-200 h-3 rounded-full overflow-hidden mb-2">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: isFull ? '#DC2626' : '#007DBD',
                }}
              />
            </View>

            {isFull ? (
              <Text className="text-sm text-red-600 font-semibold text-center">
                ⚠️ No spots available
              </Text>
            ) : (
              <Text className="text-sm text-gray-600 text-center">
                {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
              </Text>
            )}
          </View>

          {/* Purpose */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={24} color="#007DBD" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Purpose</Text>
            </View>
            <Text className="text-base text-gray-700 leading-6">{workshop.purpose}</Text>
          </View>

          {/* Target Beneficiaries */}
          {workshop.targetBeneficiaries && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Ionicons name="people-circle" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-gray-900 ml-2">Target Beneficiaries</Text>
              </View>
              <Text className="text-base text-gray-700 leading-6">{workshop.targetBeneficiaries}</Text>
            </View>
          )}

          {/* Requirements */}
          {workshop.requirements && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Ionicons name="checkbox-outline" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-gray-900 ml-2">Requirements</Text>
              </View>
              <Text className="text-base text-gray-700 leading-6">{workshop.requirements}</Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl shadow-lg mb-6 ${isFull ? 'bg-gray-400' : 'bg-[#FFB900]'}`}
            onPress={handleRegister}
            disabled={isFull}
            activeOpacity={0.8}
          >
            <Text className="text-center text-[#007DBD] text-lg font-bold">
              {isFull ? 'Workshop Full' : 'Register Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}