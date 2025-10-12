import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatWorkshopDate, getAllWorkshops, Workshop } from '../../lib/workshops';

export default function EventScreen() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const data = await getAllWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const renderWorkshop = ({ item }: { item: Workshop }) => (
    <TouchableOpacity
      className="flex-row bg-[#E0EEF7] rounded-2xl overflow-hidden mb-4 shadow-lg border border-[#007DBD]/10"
      onPress={() => router.push(`workshop/details?id=${item.$id}` as any)}
      activeOpacity={0.9}
      style={{
        shadowColor: '#007DBD',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-32 h-32" 
          style={{ resizeMode: 'cover' }}
        />
      ) : (
        <View className="w-32 h-32 bg-[#007DBD]/10 justify-center items-center">
          <Ionicons name="image-outline" size={48} color="#007DBD" opacity={0.3} />
        </View>
      )}
      <View className="flex-1 p-4 justify-between">
        <Text className="text-lg font-bold text-[#007DBD] mb-2 leading-5" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="space-y-1.5">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#007DBD" />
            <Text className="text-xs text-gray-600 ml-1.5 font-medium">
              {formatWorkshopDate(item.date)} – {item.time}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#007DBD" />
            <Text className="text-xs text-gray-600 ml-1.5 font-medium" numberOfLines={1}>
              {item.venue}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <View className="bg-[#FFB900]/15 px-3 py-1 rounded-full border border-[#FFB900]/30">
            <Text className="text-xs font-bold text-[#FFB900]">{item.category}</Text>
          </View>
          <TouchableOpacity
            className="bg-[#007DBD] py-2 px-4 rounded-lg shadow-md"
            onPress={() => router.push(`workshop/details?id=${item.$id}` as any)}
            activeOpacity={0.8}
            style={{
              shadowColor: '#007DBD',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white text-xs font-bold">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <View className="bg-[#E0EEF7] p-8 rounded-3xl shadow-lg" style={{
          shadowColor: '#007DBD',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        }}>
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="mt-4 text-[#007DBD] font-bold text-base">Loading workshops...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <View className="py-4 mb-2">
        <Text className="text-3xl font-extrabold text-[#007DBD]">Workshops</Text>
        <View className="h-1 w-20 bg-[#FFB900] rounded-full mt-2" />
      </View>
      {workshops.length === 0 ? (
        <View className="flex-1 justify-center items-center py-10">
          <View className="bg-[#E0EEF7] p-10 rounded-3xl items-center" style={{
            shadowColor: '#007DBD',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Ionicons name="sad-outline" size={64} color="#007DBD" opacity={0.5} />
            <Text className="text-[#007DBD] mt-4 text-base font-semibold">No workshops found</Text>
            <Text className="text-gray-500 mt-2 text-sm">Check back later for updates</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.$id}
          renderItem={renderWorkshop}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}