import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllHelpRequests } from '../../lib/admin';

export default function HelpRequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllHelpRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch help requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    if (filter === 'All') {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(request => request.status === filter);
      setFilteredRequests(filtered);
    }
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      rejected: requests.filter(r => r.status === 'Rejected').length,
    };
  };

  const counts = getStatusCounts();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FFF3CD', text: '#856404', icon: 'time-outline' };
      case 'Approved':
        return { bg: '#D4EDDA', text: '#155724', icon: 'checkmark-circle-outline' };
      case 'Rejected':
        return { bg: '#F8D7DA', text: '#721C24', icon: 'close-circle-outline' };
      default:
        return { bg: '#E2E8F0', text: '#4A5568', icon: 'help-circle-outline' };
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Urgent':
        return '#FF6B6B';
      case 'High':
        return '#FFA500';
      case 'Medium':
        return '#FFB900';
      case 'Low':
        return '#00B27A';
      default:
        return '#6B7280';
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const urgencyColor = getUrgencyColor(item.urgency);

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => router.push(`/admin/request-detail/${item.$id}` as any)}
        activeOpacity={0.7}
      >
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.nameSection}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#007DBD" />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{item.fullName}</Text>
              <Text style={styles.requestCode}>{item.beneficiaryRequestCode}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="help-circle" size={16} color="#007DBD" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{item.typeOfHelp}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="cash" size={16} color="#00B27A" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>${item.requestedAmount}</Text>
            </View>
          </View>
        </View>

        {/* Urgency Badge */}
        <View style={styles.urgencyContainer}>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
            <Ionicons name="alert-circle" size={14} color="#FFFFFF" />
            <Text style={styles.urgencyText}>{item.urgency} Priority</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* View Details Arrow */}
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#007DBD" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007DBD" />
          <Text style={styles.loadingText}>Loading help requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="documents" size={28} color="#007DBD" />
          <Text style={styles.headerTitle}>Help Requests</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredRequests.length}</Text>
        </View>
      </View>

      {/* Filter Tabs with Counts */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'All' && styles.filterTabActive]}
          onPress={() => handleFilterChange('All')}
        >
          <Text style={[
            styles.filterTabText, 
            selectedFilter === 'All' && styles.filterTabTextActive
          ]}>
            All ({counts.all})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'Pending' && styles.filterTabActive]}
          onPress={() => handleFilterChange('Pending')}
        >
          <Text style={[
            styles.filterTabText, 
            selectedFilter === 'Pending' && styles.filterTabTextActive
          ]}>
            Pending ({counts.pending})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'Approved' && styles.filterTabActive]}
          onPress={() => handleFilterChange('Approved')}
        >
          <Text style={[
            styles.filterTabText, 
            selectedFilter === 'Approved' && styles.filterTabTextActive
          ]}>
            Approved ({counts.approved})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, selectedFilter === 'Rejected' && styles.filterTabActive]}
          onPress={() => handleFilterChange('Rejected')}
        >
          <Text style={[
            styles.filterTabText, 
            selectedFilter === 'Rejected' && styles.filterTabTextActive
          ]}>
            Rejected ({counts.rejected})
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.$id}
        refreshing={loading}
        onRefresh={fetchRequests}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyText}>
              No {selectedFilter !== 'All' ? selectedFilter.toLowerCase() : ''} requests found
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'All' 
                ? 'New requests will appear here' 
                : `No requests with ${selectedFilter} status`}
            </Text>
          </View>
        }
      />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1c18',
    marginLeft: 12,
  },
  countBadge: {
    backgroundColor: '#007DBD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  filterTabActive: {
    backgroundColor: '#007DBD',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // List
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EEF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1c18',
  },
  requestCode: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 12,
  },
  infoIconContainer: {
    marginRight: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d1c18',
  },
  // Urgency
  urgencyContainer: {
    marginBottom: 12,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Description
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  // View Details
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007DBD',
    marginRight: 4,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});