import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HelpRequestCard from '../components/HelpRequestCard';
import { useAuth } from '../lib/auth';
import { getUserHelpRequests } from '../lib/beneficiary';

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

  // 🔄 Run when user changes
  useEffect(() => {
    fetchRequests();
  }, [user]);

  // 🔄 Run every time screen is focused (navigated back)
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user]) // also depends on user
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

  if (!user) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No user logged in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Beneficiary Profile</Text>
      <Text style={{ marginTop: 10 }}>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>

      <TouchableOpacity
        onPress={() => router.push('/beneficiary/HelpRequestFormScreen')}
        style={{ marginTop: 20, padding: 10, backgroundColor: '#4CAF50', borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Submit a Help Request</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={{ marginTop: 20, padding: 10, backgroundColor: '#F44336', borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => signOut()}
        style={{ marginTop: 20, padding: 10, backgroundColor: '#F44336', borderRadius: 5 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Logout</Text>
      </TouchableOpacity>

      {/* Section: Ongoing Help Requests */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>My Ongoing Requests</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : requests.length === 0 ? (
          <Text>No ongoing requests.</Text>
        ) : (
          requests.map((request) => (
            <HelpRequestCard
              key={request.$id}
              request={request}
              onDeleted={fetchRequests}
              onEdited={fetchRequests}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
