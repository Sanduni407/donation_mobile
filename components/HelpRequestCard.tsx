import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { deleteHelpRequest, downloadEvidenceFile } from '../lib/beneficiary';

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

interface Props {
  request: any;
  onDeleted?: () => void;
  onEdited?: () => void;
}

const HelpRequestCard: React.FC<Props> = ({ request, onDeleted, onEdited }) => {
  const handleDownload = async () => {
    if (!request.evidenceFileIds) {
      return Alert.alert('No file', 'No evidence uploaded.');
    }
    try {
      const fileUri = await downloadEvidenceFile(
        request.evidenceFileIds,
        `${request.beneficiaryRequestCode}.pdf`
      );
      Alert.alert('Downloaded', `File saved to: ${fileUri}`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to download file.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteHelpRequest(request.$id);
              Alert.alert('Deleted', 'Request has been deleted.');
              onDeleted && onDeleted();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete request.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEdit = () => {
    onEdited && onEdited();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#D1FAE5', text: COLORS.success };
      case 'rejected':
        return { bg: '#FEE2E2', text: COLORS.error };
      case 'pending':
        return { bg: '#FEF3C7', text: COLORS.accentYellow };
      default:
        return { bg: '#F3F4F6', text: COLORS.textSecondary };
    }
  };

  const statusColor = getStatusColor(request.status);

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.darkBlue, marginBottom: 4 }}>
            {request.typeOfHelp}
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }}>
            {request.description}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={{
            backgroundColor: statusColor.bg,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            marginLeft: 12,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: statusColor.text, textTransform: 'capitalize' }}>
            {request.status}
          </Text>
        </View>
      </View>

      {/* Info Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Ionicons name="cash-outline" size={14} color={COLORS.darkBlue} />
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 8, fontWeight: '500' }}>
          Rs. {request.requestedAmount}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={handleEdit}
          style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.accentYellow} />
          <Text style={{ color: COLORS.accentYellow, fontWeight: '600', fontSize: 13, marginLeft: 6 }}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor: '#FEE2E2',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={{ color: COLORS.error, fontWeight: '600', fontSize: 13, marginLeft: 6 }}>
            Delete
          </Text>
        </TouchableOpacity>

        {request.evidenceFileIds && (
          <TouchableOpacity
            onPress={handleDownload}
            style={{
              flex: 1,
              flexDirection: 'row',
              backgroundColor: COLORS.lightBlue,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={16} color={COLORS.darkBlue} />
            <Text style={{ color: COLORS.darkBlue, fontWeight: '600', fontSize: 13, marginLeft: 6 }}>
              Download
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HelpRequestCard;