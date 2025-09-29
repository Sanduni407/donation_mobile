// app/workshop/my-workshops.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { deleteWorkshop, getWorkshopsByAdmin } from '../../lib/workshops';

export default function MyWorkshopsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const list = await getWorkshopsByAdmin(user?.$id);
      setWorkshops(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkshop(id, user?.prefs?.role || 'admin', user?.$id);
      fetch();
    } catch (e) {
      console.error(e);
      alert('Failed to delete workshop');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">My Workshops</Text>

      {loading ? <ActivityIndicator size="large" /> : (
        workshops.length === 0 ? (
          <Text>No workshops created yet.</Text>
        ) : (
          workshops.map(w => (
            <View key={w.$id} className="mb-4 border rounded p-3 bg-gray-50">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-lg">{w.title}</Text>
                <Text className="text-sm">{w.status}</Text>
              </View>

              {w.imageUrl ? <Image source={{ uri: w.imageUrl }} style={{ width: '100%', height: 140, borderRadius: 6, marginBottom: 8 }} /> : null}

              <Text className="text-sm mb-1">When: {new Date(w.date).toLocaleDateString()} {w.time}</Text>
              <Text className="text-sm mb-1">Venue: {w.venue}</Text>
              <Text className="text-sm mb-2">Capacity: {w.capacity}</Text>

              <View className="flex-row space-x-2">
                {/* <TouchableOpacity onPress={() => router.push(`/workshop/edit?id=${w.$id}`)} className="flex-1 p-2 rounded border items-center">
                  <Ionicons name="pencil-outline" size={16} />
                  <Text>Edit</Text>
                </TouchableOpacity> */}

                <TouchableOpacity onPress={() => handleDelete(w.$id)} className="flex-1 p-2 rounded border items-center">
                  <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                  <Text className="text-red-600">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )
      )}
    </ScrollView>
  );
}
