import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/auth';

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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <LinearGradient
            colors={['#007DBD', '#005A8D']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" style={styles.welcomeIcon} />
            <Text style={styles.welcomeText}>Welcome back, Admin!</Text>
            <Text style={styles.welcomeSubtext}>Manage your platform effectively</Text>
          </LinearGradient>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#007DBD" />
            </View>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="document-text" size={24} color="#00B27A" />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={24} color="#FFB900" />
            </View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Workshops</Text>
          </View>
        </View>

        {/* Admin Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={24} color="#007DBD" />
            <Text style={styles.cardTitle}>Admin Profile</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="person" size={16} color="#007DBD" />
            </View>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="mail" size={16} color="#007DBD" />
            </View>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="shield" size={16} color="#007DBD" />
            </View>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{user?.prefs?.role || 'Admin'}</Text>
          </View>
        </View>

        {/* Admin Actions Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* Create Workshop */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/workshop/create')}
          >
            <LinearGradient
              colors={['#0b1220', '#0f3b80']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonText}>Create Workshop</Text>
                  <Text style={styles.buttonSubtext}>Setup a new workshop event</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* View My Workshops */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/workshop/my-workshops')}
          >
            <LinearGradient
              colors={['#ff4d6d', '#e64964']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="list-outline" size={20} color="#fff" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonText}>My Workshops</Text>
                  <Text style={styles.buttonSubtext}>View and manage workshops</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* View All Help Requests */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/admin/help-requests')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconCircleBlue}>
                <Ionicons name="help-circle-outline" size={20} color="#007DBD" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.primaryButtonText}>View All Help Requests</Text>
                <Text style={styles.primaryButtonSubtext}>Review pending requests</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#007DBD" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            onPress={() => signOut()} 
            style={styles.logoutButton}
          >
            <View style={styles.accountButtonContent}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.accountIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDelete} 
            style={styles.deleteButton}
          >
            <View style={styles.accountButtonContent}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.accountIcon} />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // Header
  header: {
    backgroundColor: '#007DBD',
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
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EEF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Main Content
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Welcome Banner
  welcomeBanner: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeIcon: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#E0EEF7',
  },
  // Statistics Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1c18',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007DBD',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0EEF7',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d1c18',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  // Actions Section
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d1c18',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientButton: {
    padding: 16,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EEF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E0EEF7',
  },
  primaryButtonText: {
    color: '#007DBD',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  primaryButtonSubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  // Account Actions
  accountActions: {
    marginTop: 24,
  },
  accountButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIcon: {
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#FFA500',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});