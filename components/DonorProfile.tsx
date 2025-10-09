// components/DonorProfile.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { getDonationsByDonor } from '../lib/donations';
import { getDonorPreferences, saveDonorPreferences } from '../lib/donorPreferences';
import DonationChart from './DonationChart';
import PreferencesModal from './PreferencesModal';

type Donation = {
  $id: string;
  donorId: string;
  postId: string;
  beneficiaryRequestCode: string;
  amountLKR: number; 
  amountUSD: number;
  paymentIntentId: string;
  paymentStatus: 'succeeded' | 'failed' | 'pending';
  donorName: string;
  beneficiaryName: string;
  createdAt: string;
};

export default function DonorProfile() {
  const { user, signOut , deleteAccount } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  const fetchData = async () => {
    if (!user?.$id) return;

    try {
      // ✅ fix: cast through unknown to avoid TS error
      const donationsData = await getDonationsByDonor(user.$id);
      setDonations(donationsData as unknown as Donation[]);

      // Fetch preferences
      const prefsData = await getDonorPreferences(user.$id);
      if (prefsData) {
        setPreferences(prefsData.preferences);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSavePreferences = async (newPreferences: string[]) => {
    if (!user?.$id) return;
    await saveDonorPreferences(user.$id, newPreferences);
    setPreferences(newPreferences);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };


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


  // Calculate statistics
  const totalDonated = donations.reduce((sum, d) => sum + d.amountLKR, 0);
  const totalDonations = donations.length;
  const successfulDonations = donations.filter(d => d.paymentStatus === 'succeeded').length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007DBD" />
          <Text className="mt-3 text-base text-[#007DBD] font-medium">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F9FC]" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007DBD']} />
        }
      >
        {/* Header Section */}
        <View className="bg-[#007DBD] px-5 pt-6 pb-8 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-white">My Profile</Text>
          </View>

          {/* User Info Card */}
          <View className="bg-white rounded-2xl p-5 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="bg-[#E0EEF7] w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="person" size={32} color="#007DBD" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  {user?.name || 'Donor'}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {user?.email}
                </Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row justify-between pt-4 border-t border-gray-200">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-[#007DBD]">
                  {totalDonations}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Donations</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-[#007DBD]">
                  Rs. {totalDonated.toLocaleString()}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Total Given</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-[#16A34A]">
                  {successfulDonations}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Successful</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-5 pt-5 pb-6">
          {/* Donation Preferences Card */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="heart-settings" size={24} color="#007DBD" />
                <Text className="text-lg font-bold text-[#007DBD] ml-2">
                  Donation Preferences
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(true)}
                className="bg-[#E0EEF7] px-4 py-2 rounded-xl"
              >
                <Text className="text-[#007DBD] font-semibold text-sm">
                  {preferences.length > 0 ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            {preferences.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {preferences.map((pref, index) => (
                  <View
                    key={index}
                    className="bg-[#E0EEF7] px-4 py-2 rounded-full"
                  >
                    <Text className="text-[#007DBD] text-sm font-medium">
                      {pref}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(true)}
                className="bg-[#F5F9FC] p-4 rounded-xl items-center border border-dashed border-[#007DBD]"
              >
                <Ionicons name="add-circle-outline" size={32} color="#007DBD" />
                <Text className="text-[#007DBD] text-sm font-medium mt-2">
                  Set your donation preferences
                </Text>
                <Text className="text-gray-500 text-xs mt-1 text-center">
                  Get personalized recommendations based on your interests
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Donation Chart */}
          <DonationChart donations={donations} />

          {/* Recent Donations */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mt-5">
            <Text className="text-lg font-bold text-[#007DBD] mb-4">
              Recent Donations
            </Text>
            {donations.length > 0 ? (
              donations.slice(0, 5).map((donation) => (
                <View
                  key={donation.$id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800">
                      {donation.beneficiaryName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {donation.createdAt
                        ? new Date(donation.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unknown'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-[#007DBD]">
                      Rs. {donation.amountLKR.toLocaleString()}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full mt-1 ${
                        donation.paymentStatus === 'succeeded'
                          ? 'bg-green-100'
                          : donation.paymentStatus === 'failed'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          donation.paymentStatus === 'succeeded'
                            ? 'text-green-700'
                            : donation.paymentStatus === 'failed'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}
                      >
                        {donation.paymentStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <MaterialCommunityIcons name="hand-heart" size={48} color="#E0EEF7" />
                <Text className="text-gray-400 text-center mt-3">
                  No donations yet.{'\n'}Start making a difference today!
                </Text>
              </View>
            )}
          </View>

          {/* Account Actions */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mt-5">
            <Text className="text-lg font-bold text-[#007DBD] mb-4">
              Account Settings
            </Text>
            
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                <Text className="text-base font-medium text-gray-800 ml-3">
                  Logout
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

              <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="warning-outline" size={22} color="#DC2626" />
                <Text className="text-base font-medium text-gray-800 ml-3">
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>


          </View>
        </View>
      </ScrollView>

      {/* Preferences Modal */}
      <PreferencesModal
        visible={preferencesModalVisible}
        onClose={() => setPreferencesModalVisible(false)}
        initialPreferences={preferences}
        onSave={handleSavePreferences}
      />
    </SafeAreaView>
  );
}
