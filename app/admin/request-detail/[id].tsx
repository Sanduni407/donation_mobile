import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createBeneficiaryPost,
  downloadEvidenceFile,
  updateHelpRequestStatus,
} from '../../../lib/admin';
import { databases } from '../../../lib/appwrite';

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

export default function RequestDetail() {
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = await databases.getDocument(
        '68d797e8002551ac5a86',
        'helprequests',
        id as string
      );
      setRequest(response);
    } catch (error) {
      console.error('Error fetching request detail:', error);
      Alert.alert('Error', 'Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequestDetail();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    try {
      setUpdating(true);
      await updateHelpRequestStatus(id as string, status);
      setRequest({ ...request, status });
      Alert.alert('Success', `Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadEvidence = async () => {
    if (!request.evidenceFileIds) {
      Alert.alert('No File', 'No evidence file available for download');
      return;
    }

    try {
      setDownloading(true);
      const fileName = `evidence_${request.beneficiaryRequestCode}.pdf`;
      const localUri = await downloadEvidenceFile(request.evidenceFileIds, fileName);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      } else {
        Alert.alert('Success', `File downloaded to: ${localUri}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download evidence file');
    } finally {
      setDownloading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setUpdating(true);

      const postData = {
        helpRequestId: request.$id,
        beneficiaryRequestCode: request.beneficiaryRequestCode,
        beneficiaryName: request.fullName,
        description: request.description,
        itemsNeeded: request.itemsNeeded,
        goalAmount: request.requestedAmount,
        urgencyLevel: request.urgency,
        typeOfHelp: request.typeOfHelp,
      };

      const createdPost = await createBeneficiaryPost(postData);

      Alert.alert('Success', 'Post created successfully! Now add an image.', [
        {
          text: 'Add Image',
          onPress: () => router.push(`/admin/add-image/${createdPost.$id}` as any),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', `Failed to create post: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: COLORS.lightBlue,
              paddingHorizontal: 32,
              paddingVertical: 40,
              borderRadius: 24,
              alignItems: 'center',
              shadowColor: COLORS.darkBlue,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <ActivityIndicator size="large" color={COLORS.darkBlue} />
            <Text
              style={{
                marginTop: 16,
                color: COLORS.darkBlue,
                fontWeight: '700',
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Loading request details...
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
              Please wait
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State
  if (!request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: COLORS.lightBlue,
              paddingHorizontal: 40,
              paddingVertical: 48,
              borderRadius: 24,
              alignItems: 'center',
              shadowColor: COLORS.darkBlue,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="alert-circle-outline" size={72} color={COLORS.darkBlue} />
            <Text
              style={{
                color: COLORS.darkBlue,
                marginTop: 16,
                fontSize: 20,
                fontWeight: '700',
              }}
            >
              Request Not Found
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 8, fontSize: 14 }}>
              This request doesn't exist
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main Content
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '800',
              color: COLORS.darkBlue,
              marginBottom: 8,
            }}
          >
            Request Details
          </Text>
          <View
            style={{
              height: 5,
              width: 60,
              backgroundColor: COLORS.accentYellow,
              borderRadius: 3,
            }}
          />
        </View>

        {/* Status Badge */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 20,
            borderLeftWidth: 5,
            borderLeftColor: COLORS.accentYellow,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' }}>
            Current Status
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.darkBlue,
              marginTop: 4,
              textTransform: 'capitalize',
            }}
          >
            {request.status}
          </Text>
        </View>

        {/* Info Cards */}
        <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 24 }}>
          {/* Beneficiary Name */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Beneficiary Name
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' }}>
              {request.fullName}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 20 }} />

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Description
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 }}>
              {request.description}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 20 }} />

          {/* Type of Help */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="heart-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Type of Help
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' }}>
              {request.typeOfHelp}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 20 }} />

          {/* Items Needed */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="list-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Items Needed
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 }}>
              {request.itemsNeeded}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 20 }} />

          {/* Amount */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="cash-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Requested Amount
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: COLORS.darkBlue, fontWeight: '700' }}>
              Rs. {request.requestedAmount}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 20 }} />

          {/* Urgency */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="alert-outline" size={20} color={COLORS.darkBlue} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.darkBlue, marginLeft: 8 }}>
                Urgency Level
              </Text>
            </View>
            <View
              style={{
                backgroundColor: COLORS.lightBlue,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 14, color: COLORS.darkBlue, fontWeight: '600' }}>
                {request.urgency}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 10 }}>
          {/* Approve */}
          <TouchableOpacity
            onPress={() => handleStatusUpdate('APPROVED')}
            disabled={updating}
            style={{
              backgroundColor: '#D1FAE5',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: updating ? 0.6 : 1,
            }}
          >
            <Ionicons name="checkmark" size={18} color={COLORS.success} />
            <Text style={{ color: COLORS.success, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
              {updating ? 'Updating...' : 'Approve'}
            </Text>
          </TouchableOpacity>

          {/* Reject */}
          <TouchableOpacity
            onPress={() => handleStatusUpdate('REJECTED')}
            disabled={updating}
            style={{
              backgroundColor: '#FEE2E2',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: updating ? 0.6 : 1,
            }}
          >
            <Ionicons name="close" size={18} color={COLORS.error} />
            <Text style={{ color: COLORS.error, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
              {updating ? 'Updating...' : 'Reject'}
            </Text>
          </TouchableOpacity>

          {/* Download Evidence */}
          <TouchableOpacity
            onPress={handleDownloadEvidence}
            disabled={downloading}
            style={{
              backgroundColor: COLORS.lightBlue,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <Ionicons name="download" size={18} color={COLORS.darkBlue} />
            <Text style={{ color: COLORS.darkBlue, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
              {downloading ? 'Downloading...' : 'Download Evidence'}
            </Text>
          </TouchableOpacity>

          {/* Create Post */}
          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={updating}
            style={{
              backgroundColor: '#FEF3C7',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: updating ? 0.6 : 1,
            }}
          >
            <Ionicons name="add" size={18} color={COLORS.accentYellow} />
            <Text style={{ color: COLORS.accentYellow, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
              {updating ? 'Processing...' : 'Create Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}