import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { deleteWorkshop, getWorkshopsByAdmin } from '../../lib/workshops';

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

  const handleDelete = async (id: string, title: string) => {
    Alert.alert(
      'Delete Workshop',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteWorkshop(id, user?.prefs?.role || 'admin', user?.$id);
              fetch();
              Alert.alert('Success', 'Workshop deleted successfully');
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to delete workshop');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: COLORS.success, label: 'Active' };
      case 'pending':
        return { bg: '#FEF3C7', text: COLORS.accentYellow, label: 'Pending' };
      case 'completed':
        return { bg: '#E0E7FF', text: '#6366F1', label: 'Completed' };
      default:
        return { bg: '#F3F4F6', text: COLORS.textSecondary, label: status?.toUpperCase() };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: COLORS.darkBlue, marginBottom: 8 }}>
            My Workshops
          </Text>
          <View style={{ height: 4, width: 50, backgroundColor: COLORS.accentYellow, borderRadius: 2 }} />
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <View
              style={{
                backgroundColor: COLORS.lightBlue,
                paddingHorizontal: 32,
                paddingVertical: 40,
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: COLORS.darkBlue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <ActivityIndicator size="large" color={COLORS.darkBlue} />
              <Text style={{ marginTop: 16, color: COLORS.darkBlue, fontWeight: '700', fontSize: 16 }}>
                Loading workshops...
              </Text>
            </View>
          </View>
        ) : workshops.length === 0 ? (
          // Empty State
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: COLORS.lightBlue,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="calendar-outline" size={40} color={COLORS.darkBlue} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 8 }}>
                No workshops yet
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>
                Create your first workshop to get started
              </Text>
            </View>
          </View>
        ) : (
          // Workshops List
          <View style={{ gap: 16 }}>
            {workshops.map((w) => {
              const statusColor = getStatusColor(w.status);
              return (
                <View
                  key={w.$id}
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 16,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Image */}
                  {w.imageUrl ? (
                    <Image
                      source={{ uri: w.imageUrl }}
                      style={{
                        width: '100%',
                        height: 160,
                        resizeMode: 'cover',
                      }}
                    />
                  ) : (
                    <View style={{ width: '100%', height: 160, backgroundColor: COLORS.lightBlue, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="image-outline" size={40} color={COLORS.darkBlue} opacity={0.3} />
                    </View>
                  )}

                  {/* Content */}
                  <View style={{ padding: 16 }}>
                    {/* Title and Status */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: COLORS.darkBlue,
                          flex: 1,
                          marginRight: 12,
                        }}
                        numberOfLines={2}
                      >
                        {w.title}
                      </Text>

                      {/* Status Badge */}
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: statusColor.bg,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor.text }}>
                          {statusColor.label}
                        </Text>
                      </View>
                    </View>

                    {/* Info Rows */}
                    <View style={{ gap: 10, marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.darkBlue} />
                        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 10, fontWeight: '500' }}>
                          {new Date(w.date).toLocaleDateString()} at {w.time}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={16} color={COLORS.darkBlue} />
                        <Text
                          style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 10, fontWeight: '500' }}
                          numberOfLines={1}
                        >
                          {w.venue}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="people-outline" size={16} color={COLORS.darkBlue} />
                        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 10, fontWeight: '500' }}>
                          {w.capacity} attendees
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity
                      onPress={() => handleDelete(w.$id, w.title)}
                      style={{
                        flexDirection: 'row',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: '#FEE2E2',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                      <Text style={{ color: COLORS.error, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}