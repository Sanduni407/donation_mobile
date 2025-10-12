import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarButton}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentContainer}>
        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Donations Received</Text>
            <Text style={styles.statValue}>$1,250</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Requests</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Requests</Text>
            <Text style={styles.statValue}>1</Text>
          </View>
        </View>

        {/* My Requests Section */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>My Requests</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : requests.length === 0 ? (
            <Text style={styles.emptyText}>No ongoing requests.</Text>
          ) : (
            <View style={styles.requestsList}>
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => router.push('/beneficiary/HelpRequestFormScreen')}
            style={styles.submitButton}
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.submitButtonText}>Submit Help Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          >
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signOut()}
            style={styles.logoutButton}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header Styles
  header: {
    backgroundColor: '#007DBD',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EEF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  // Main Content
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  // Statistics
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#E0EEF7',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007DBD',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFB900',
  },
  // Requests Section
  requestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007DBD',
    marginBottom: 16,
  },
  requestsList: {
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  // Action Buttons
  actionButtons: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  submitButton: {
    backgroundColor: '#00B27A',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  addIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});