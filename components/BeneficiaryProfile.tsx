import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HelpRequestCard from '../components/HelpRequestCard';
import { useAuth } from '../lib/auth';
import { getUserHelpRequests } from '../lib/beneficiary';

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

export default function BeneficiaryProfile() {
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docs = await getUserHelpRequests(user.$id);
      setRequests(docs);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch your requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user])
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount() },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(), style: 'destructive' },
      ]
    );
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>No user logged in.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.darkBlue, paddingHorizontal: 16, paddingVertical: 16, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/44' }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.white }}>Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Statistics Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="wallet-outline" size={24} color={COLORS.success} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Donations
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                $1,250
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Active
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                {requests.filter(r => r.status === 'active').length}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 16,
                borderRadius: 14,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Ionicons name="time-outline" size={24} color={COLORS.accentYellow} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Pending
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                {requests.filter(r => r.status === 'pending').length}
              </Text>
            </View>
          </View>
        </View>

        {/* My Requests Section */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.darkBlue }}>My Requests</Text>
            <View style={{ height: 3, width: 40, backgroundColor: COLORS.accentYellow, borderRadius: 2 }} />
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.darkBlue} />
              <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textSecondary }}>Loading requests...</Text>
            </View>
          ) : requests.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="document-outline" size={48} color={COLORS.lightBlue} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 12 }}>
                No ongoing requests
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' }}>
                Create your first request to get started
              </Text>
            </View>
          ) : (
            <View>
              {requests.map((request) => (
                <HelpRequestCard
                  key={request.$id}
                  request={request}
                  onDeleted={fetchRequests}
                  onEdited={fetchRequests}
                />
              ))}
            </View>
          )}
        </View>

        {/* Submit Request Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            borderTopWidth: 3,
            borderTopColor: COLORS.success,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#D1FAE5',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.success} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue }}>
                Need Help?
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                Submit a new help request
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/beneficiary/HelpRequestFormScreen')}
            style={{
              flexDirection: 'row',
              backgroundColor: COLORS.success,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 15, marginLeft: 6 }}>
              Submit Request
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Card Header */}
          <View
            style={{
              backgroundColor: COLORS.lightBlue,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="settings-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 10 }}>
                Account Settings
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={{ padding: 16, gap: 12 }}>
            {/* User Info */}
            <View
              style={{
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 }}>
                USER INFORMATION
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>
                {user.name || 'User'}
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
                {user.email || 'No email'}
              </Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                backgroundColor: '#FEF3C7',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.accentYellow} />
              <Text style={{ color: COLORS.accentYellow, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={{
                flexDirection: 'row',
                backgroundColor: '#FEE2E2',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}