import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteHelpRequest } from '../lib/beneficiary';

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

interface HelpRequestCardProps {
  request: any;
  onDeleted?: () => void;
  onEdited?: () => void;
}

export default function HelpRequestCard({ request, onDeleted, onEdited }: HelpRequestCardProps) {
  const router = useRouter();

  const handleDelete = () => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this help request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHelpRequest(request.$id);
              Alert.alert('Success', 'Request deleted successfully');
              if (onDeleted) onDeleted();
            } catch (error) {
              console.error('Error deleting request:', error);
              Alert.alert('Error', 'Failed to delete request');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return COLORS.success;
      case 'pending':
        return COLORS.accentYellow;
      case 'rejected':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      case 'low':
        return '#10B981';
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{request.status || 'Pending'}</Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(request.urgency) }]}>
            <Text style={styles.urgencyText}>{request.urgency || 'Medium'}</Text>
          </View>
        </View>
        <Text style={styles.requestCode}>#{request.beneficiaryRequestCode}</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{request.fullName}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{request.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="medical-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{request.typeOfHelp}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {request.description}
        </Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Requested Amount:</Text>
          <Text style={styles.amountValue}>LKR {request.requestedAmount?.toLocaleString()}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            router.push({
              pathname: '/beneficiary/HelpRequestFormScreen',
              params: {
                requestId: request.$id,
                fullName: request.fullName,
                age: request.age.toString(),
                location: request.location,
                typeOfHelp: request.typeOfHelp,
                description: request.description,
                requestedAmount: request.requestedAmount.toString(),
                paymentDetails: request.paymentDetails,
                urgency: request.urgency,
                itemsNeeded: JSON.stringify(request.itemsNeeded),
                evidenceFileIds: request.evidenceFileIds || '',
              },
            });
          }}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.darkBlue} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  requestCode: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkBlue,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBlue,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
});