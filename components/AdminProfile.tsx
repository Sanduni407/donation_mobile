import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

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

export default function AdminProfile() {
  const { user, signOut, deleteAccount } = useAuth();
  const router = useRouter();

  const handleDelete = () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.darkBlue,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: COLORS.white,
          }}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/44' }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.white }}>
          Admin Dashboard
        </Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner */}
        <View
          style={{
            backgroundColor: COLORS.darkBlue,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Ionicons name="shield-checkmark" size={40} color={COLORS.white} style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.white, marginBottom: 4 }}>
            Welcome back, Admin!
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.lightBlue, textAlign: 'center' }}>
            Manage your platform effectively
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 }}>
            Platform Stats
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
              <Ionicons name="people-outline" size={24} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Users
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                156
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
              <Ionicons name="document-text-outline" size={24} color={COLORS.success} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Requests
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                42
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
              <Ionicons name="calendar-outline" size={24} color={COLORS.accentYellow} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Workshops
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.darkBlue, marginTop: 4 }}>
                8
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Profile Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.lightBlue,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 10 }}>
                Admin Profile
              </Text>
            </View>
          </View>

          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>
                NAME
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary }}>
                {user?.name || 'Administrator'}
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>
                EMAIL
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary }}>
                {user?.email || 'admin@example.com'}
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>
                ROLE
              </Text>
              <View
                style={{
                  backgroundColor: COLORS.lightBlue,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue }}>
                  {user?.prefs?.role || 'Admin'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 12 }}>
            Quick Actions
          </Text>

          {/* Create Workshop */}
          <TouchableOpacity
            onPress={() => router.push('/workshop/create')}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              borderTopWidth: 3,
              borderTopColor: COLORS.success,
            }}
            activeOpacity={0.8}
          >
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
              <Ionicons name="create-outline" size={20} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 2 }}>
                Create Workshop
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Setup a new workshop event
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>

          {/* My Workshops */}
          <TouchableOpacity
            onPress={() => router.push('/workshop/my-workshops')}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              borderTopWidth: 3,
              borderTopColor: COLORS.accentYellow,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#FEF3C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="list-outline" size={20} color={COLORS.accentYellow} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 2 }}>
                My Workshops
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                View and manage workshops
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.darkBlue} />
          </TouchableOpacity>

          {/* View All Help Requests */}
          <TouchableOpacity
            onPress={() => router.push('/admin/help-requests')}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              borderTopWidth: 3,
              borderTopColor: COLORS.darkBlue,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: COLORS.lightBlue,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color={COLORS.darkBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 2 }}>
                View All Help Requests
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Review pending requests
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.darkBlue} />
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
              onPress={handleDelete}
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